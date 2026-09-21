// Ultra Bridge agent: connects to Sanity Context MCP and streams an answer.
// Author: Demir Ajvazi
import {createMCPClient} from '@ai-sdk/mcp'
import {convertToModelMessages, stepCountIs, streamText, type LanguageModel, type UIMessage} from 'ai'
import {log} from './log'
import {buildSystemPrompt} from './prompt'

type McpClient = Awaited<ReturnType<typeof createMCPClient>>

export type AgentConfig = {
  token: string
  groqUrl: string
  kbUrl?: string
}

export function readAgentConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  const token = env.SANITY_ORGANIZATION_TOKEN
  const groqUrl = env.SANITY_CONTEXT_MCP_URL
  if (!token || !groqUrl) {
    throw new ConfigError('SANITY_CONTEXT_MCP_URL and SANITY_ORGANIZATION_TOKEN must be set.')
  }
  return {token, groqUrl, kbUrl: env.SANITY_CONTEXT_KB_MCP_URL || undefined}
}

export class ConfigError extends Error {}

const CONNECT_TIMEOUT_MS = 15_000

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${CONNECT_TIMEOUT_MS} ms`)), CONNECT_TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function fetchInitialContext(url: string, token: string): Promise<string> {
  const u = new URL(url)
  u.pathname = `${u.pathname.replace(/\/$/, '')}/initial-context`
  const res = await fetch(u, {headers: {Authorization: `Bearer ${token}`}, signal: AbortSignal.timeout(CONNECT_TIMEOUT_MS)})
  if (!res.ok) throw new Error(`initial-context request failed with status ${res.status}`)
  return res.text()
}

// Free model tiers limit tokens per minute, so every request must stay small. Only the tools
// the agent needs are exposed, and their results are compacted and capped.
const ALLOWED_TOOLS = new Set(['groq_query', 'knowledge_base_read'])
const MAX_TOOL_RESULT_CHARS = Number(process.env.MAX_TOOL_RESULT_CHARS ?? 6000)

function compactText(text: string): string {
  let out = text
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && parsed.meta && typeof parsed.meta === 'object') {
      delete parsed.meta.executedQuery // The model wrote this query itself.
    }
    out = JSON.stringify(parsed)
  } catch {
    // Not JSON: keep as is.
  }
  if (out.length > MAX_TOOL_RESULT_CHARS) {
    out = `${out.slice(0, MAX_TOOL_RESULT_CHARS)} ...[result cut off at ${MAX_TOOL_RESULT_CHARS} characters: run a narrower query, for example one screen reader, one action or fewer fields]`
  }
  return out
}

function slimTools<T extends Record<string, any>>(tools: T): T {
  const slim: Record<string, any> = {}
  for (const [name, tool] of Object.entries(tools)) {
    if (process.env.ULTRA_ALL_TOOLS !== '1' && !ALLOWED_TOOLS.has(name)) continue
    if (typeof tool?.execute !== 'function') {
      slim[name] = tool
      continue
    }
    slim[name] = {
      ...tool,
      execute: async (...args: unknown[]) => {
        const result = await tool.execute(...args)
        if (result && Array.isArray(result.content)) {
          return {...result, content: result.content.map((c: any) => (c?.type === 'text' && typeof c.text === 'string' ? {...c, text: compactText(c.text)} : c))}
        }
        return result
      },
    }
  }
  return slim as T
}

async function connect(url: string, token: string) {
  const client = await withTimeout(
    createMCPClient({transport: {type: 'http', url, headers: {Authorization: `Bearer ${token}`}}}),
    'MCP connection',
  )
  // The initial context is inlined into the system prompt, so the tool itself is dropped.
  const {initial_context: _dropped, ...allTools} = await withTimeout(client.tools(), 'MCP tool listing')
  return {client, tools: slimTools(allTools)}
}

export type Connected = {
  system: string
  tools: Awaited<ReturnType<typeof connect>>['tools']
  close: () => Promise<void>
  usingKnowledgeBase: boolean
}

export async function connectAgent(config: AgentConfig): Promise<Connected> {
  const clients: McpClient[] = []
  const close = async () => {
    await Promise.allSettled(clients.map((c) => c.close()))
  }

  try {
    const [groqContext, groq] = await Promise.all([
      fetchInitialContext(config.groqUrl, config.token),
      connect(config.groqUrl, config.token),
    ])
    clients.push(groq.client)
    let tools = {...groq.tools}
    let kbOutline: string | undefined

    if (config.kbUrl) {
      try {
        const [outline, kb] = await Promise.all([
          fetchInitialContext(config.kbUrl, config.token),
          connect(config.kbUrl, config.token),
        ])
        clients.push(kb.client)
        kbOutline = outline
        tools = {...tools, ...kb.tools}
      } catch (err) {
        // The knowledge base is optional. Carry on with the structured data only.
        log.warn('[ultra-bridge] Knowledge base unavailable, continuing without it:', err)
      }
    }

    return {
      system: buildSystemPrompt({groqContext, kbOutline}),
      tools,
      close,
      usingKnowledgeBase: Boolean(kbOutline),
    }
  } catch (err) {
    await close()
    throw err
  }
}

export async function streamAnswer(opts: {
  messages: UIMessage[]
  model: LanguageModel
  connected: Connected
  abortSignal?: AbortSignal
}) {
  const {messages, model, connected, abortSignal} = opts
  const result = streamText({
    model,
    system: connected.system,
    messages: await convertToModelMessages(messages),
    tools: connected.tools,
    stopWhen: stepCountIs(8),
    // With several providers configured, failing over is faster than waiting to retry one.
    maxRetries: Number(process.env.MODEL_MAX_RETRIES ?? 0),
    temperature: 0,
    abortSignal,
    onFinish: async () => {
      log.info('[ultra-bridge] answer finished')
      await connected.close()
    },
    onAbort: async () => {
      await connected.close()
    },
    onError: async ({error}) => {
      log.error('[ultra-bridge] stream error:', error)
      await connected.close()
    },
  })
  return result
}
