// A small scripted "model" so the app can run without an API key (demo and tests).
// It maps a handful of question shapes to the GROQ queries used by the real agent
// and prints the rows it gets back. It is deliberately simple and says so.
// Author: Demir Ajvazi
import {simulateReadableStream, type LanguageModel} from 'ai'
import {MockLanguageModelV3} from 'ai/test'

const usage = {
  inputTokens: {total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined},
  outputTokens: {total: 1, text: 1, reasoning: undefined},
}

function lastUserText(prompt: any[]): string {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const m = prompt[i]
    if (m.role === 'user') {
      return (m.content as any[]).filter((p) => p.type === 'text').map((p) => p.text).join(' ')
    }
  }
  return ''
}

function findToolText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = findToolText(v)
      if (t) return t
    }
    return undefined
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (typeof o.text === 'string') return o.text
    // Only follow the keys that carry payloads. Never return the "type" label.
    for (const k of ['content', 'value', 'output', 'result']) {
      if (k in o) {
        const t = findToolText(o[k])
        if (t) return t
      }
    }
  }
  return undefined
}

export function queryFor(question: string): {query: string; kind: string} {
  const q = question.toLowerCase()
  const keyMatch = question.match(/\b(?:insert|capslock|jaws)\s*\+\s*([a-z0-9]+)/i)
  if (/collid|different (job|mean)|same key|conflict|mean something else|change meaning/.test(q)) {
    return {
      kind: 'collisions',
      query: `*[_type=="command" && screenReader->slug.current=="jaws" && context=="browse-mode"]{keys, "jawsAction": action->title, "nvdaMeansSomethingElse": *[_type=="command" && screenReader->slug.current=="nvda" && keys==^.keys && action._ref != ^.action._ref]{"action": action->title}}[count(nvdaMeansSomethingElse)>0]`,
    }
  }
  if (/lack|\bno\b.*\bequivalent|has no|only jaws|doesn.t have|does not have|without/.test(q)) {
    return {
      kind: 'lacks',
      query: `*[_type=="action" && count(*[_type=="command" && action._ref==^._id && screenReader->slug.current=="jaws"])>0 && count(*[_type=="command" && action._ref==^._id && screenReader->slug.current=="nvda"])==0]{title, "jaws": *[_type=="command" && action._ref==^._id && screenReader->slug.current=="jaws"].keys}`,
    }
  }
  if (/verif|trust|recalled|certain|confiden|unsure/.test(q)) {
    return {
      kind: 'verification',
      query: `*[_type=="command" && verification in ["recalled","third-party"]]{label, verification, note}`,
    }
  }
  if (keyMatch) {
    const keys = `Insert+${keyMatch[1].toUpperCase()}`
    return {
      kind: 'translate',
      query: `*[_type=="command" && screenReader->slug.current=="jaws" && keys=="${keys}"]{keys, layout, "action": action->title, "nvda": *[_type=="command" && action._ref==^.action._ref && screenReader->slug.current=="nvda"]{keys, layout, note, verification, "sources": sources[]->{title, url}}}`,
    }
  }
  if (/first|learn|start|switch|beginner|why|how do i/.test(q) && /nvda|jaws/.test(q)) {
    return {
      kind: 'gotchas',
      query: `*[_type=="difference" && severity=="high"]{title, summary, workaround}`,
    }
  }
  const word = (q.match(/\b(links?|headings?|tables?|buttons?|forms?|read|line|word|character|find|search|speech|landmark|mode)\b/) ?? [])[1] ?? 'read'
  const stem = word.replace(/s$/, '')
  return {
    kind: 'action',
    query: `*[_type=="action" && (title match "${stem}*" || phrases[] match "${stem}*" || description match "${stem}*")]{title, "commands": *[_type=="command" && action._ref==^._id]{"reader": screenReader->name, keys, layout, verification}}`,
  }
}

function summarise(kind: string, raw: string): string {
  let rows: any[] = []
  try {
    const parsed = JSON.parse(raw)
    const r = parsed.result ?? parsed
    rows = Array.isArray(r) ? r : [r]
  } catch {
    return 'The lookup returned data I could not read.'
  }
  if (rows.length === 0) return 'The data has no matching entries.'
  const lines: string[] = []
  for (const row of rows.slice(0, 12)) {
    if (row.error) return `The query failed: ${row.error}`
    if (kind === 'collisions') {
      lines.push(`- ${row.keys}: in JAWS it means "${row.jawsAction}", in NVDA it means "${(row.nvdaMeansSomethingElse ?? []).map((x: any) => x.action).join('; ')}".`)
    } else if (kind === 'lacks') {
      lines.push(`- ${row.title}. JAWS keys: ${(row.jaws ?? []).join(', ')}. No NVDA default in the data.`)
    } else if (kind === 'verification') {
      lines.push(`- ${row.label} (${row.verification}).`)
    } else if (kind === 'translate') {
      const nvda = (row.nvda ?? []).map((c: any) => `${c.keys} (${c.layout}, ${c.verification})`).join('; ')
      lines.push(`- ${row.keys} in JAWS is "${row.action}". In NVDA: ${nvda || 'no default key in the data'}.`)
    } else if (kind === 'gotchas') {
      lines.push(`- ${row.title}. ${row.workaround}`)
    } else {
      const cmds = (row.commands ?? []).map((c: any) => `${c.reader} ${c.keys} (${c.layout})`).join('; ')
      lines.push(`- ${row.title}: ${cmds}`)
    }
  }
  return lines.join('\n')
}

export function createOfflineModel(): LanguageModel {
  return new MockLanguageModelV3({
    doStream: async ({prompt}: {prompt: any[]}) => {
      const last = prompt[prompt.length - 1]
      const question = lastUserText(prompt)
      if (last?.role === 'tool') {
        const toolText = findToolText(last.content) ?? ''
        const {kind} = queryFor(question)
        const text = `Offline demo mode, no language model. Here is what the structured data says:\n${summarise(kind, toolText)}`
        return {
          stream: simulateReadableStream({
            chunks: [
              {type: 'text-start', id: 't1'},
              {type: 'text-delta', id: 't1', delta: text},
              {type: 'text-end', id: 't1'},
              {type: 'finish', finishReason: {unified: 'stop', raw: undefined}, logprobs: undefined, usage},
            ] as any,
            chunkDelayInMs: null,
            initialDelayInMs: null,
          }),
        }
      }
      const {query} = queryFor(question)
      return {
        stream: simulateReadableStream({
          chunks: [
            {type: 'tool-call', toolCallId: `call-${Date.now()}`, toolName: 'groq_query', input: JSON.stringify({query})},
            {type: 'finish', finishReason: {unified: 'tool-calls', raw: undefined}, logprobs: undefined, usage},
          ] as any,
          chunkDelayInMs: null,
          initialDelayInMs: null,
        }),
      }
    },
  })
}
