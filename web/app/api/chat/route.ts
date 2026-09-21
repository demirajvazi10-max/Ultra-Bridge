// Chat endpoint. Author: Demir Ajvazi
import type {UIMessage} from 'ai'
import {ConfigError, connectAgent, readAgentConfig, streamAnswer} from '@/lib/agent'
import {pickModel} from '@/lib/model'
import {cacheKey, cacheWhileStreaming, getCached} from '@/lib/answer-cache'
import {log} from '@/lib/log'
import {rateLimit} from '@/lib/rate-limit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_MESSAGES = 12
const MAX_CHARS = 1000

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json', ...headers}})
}

function describeStreamError(error: unknown): string {
  const text = String((error as {message?: unknown})?.message ?? error)
  if (/quota|429|rate.?limit|resource.?exhausted|too many requests/i.test(text)) {
    return 'The AI model is rate limited right now. Please wait a minute and ask again.'
  }
  if (/api key|permission|unauthori[sz]ed|401|403/i.test(text)) {
    return 'The AI model rejected its credentials. The site owner needs to check the model key.'
  }
  return 'The assistant could not finish this answer. Please try again.'
}

export async function POST(req: Request) {
  let messages: UIMessage[]
  try {
    const body = await req.json()
    messages = Array.isArray(body?.messages) ? body.messages : []
  } catch {
    return json(400, {error: 'The request was not valid JSON.'})
  }
  if (messages.length === 0) return json(400, {error: 'No messages were sent.'})
  messages = messages.slice(-MAX_MESSAGES)
  for (const m of messages) {
    for (const p of m.parts ?? []) {
      if (p.type === 'text' && p.text.length > MAX_CHARS) {
        return json(400, {error: `Please keep each message under ${MAX_CHARS} characters.`})
      }
    }
  }

  // A repeated first question is answered from the cache: instant, and it costs no model quota.
  const firstText = messages.length === 1 ? messages[0].parts?.find((p) => p.type === 'text') : undefined
  const key = firstText && firstText.type === 'text' ? cacheKey(firstText.text) : undefined
  if (key) {
    const hit = getCached(key)
    if (hit) return hit
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limit = rateLimit(ip, Number(process.env.RATE_LIMIT_PER_MINUTE ?? 8))
  if (!limit.ok) {
    return json(429, {error: `Too many questions. Try again in ${limit.retryAfterSeconds} seconds.`}, {'retry-after': String(limit.retryAfterSeconds)})
  }

  let connected
  try {
    const {model, label} = pickModel()
    log.info(`[ultra-bridge] question received, model ${label}, connecting to Sanity...`)
    const t0 = Date.now()
    connected = await connectAgent(readAgentConfig())
    log.info(`[ultra-bridge] connected to Sanity in ${Date.now() - t0} ms, asking the model...`)
    // The request signal is deliberately not passed to the model: on some setups it fires
    // early and silently ends the stream. The step limit and the timeouts bound the work.
    req.signal.addEventListener('abort', () => log.info('[ultra-bridge] client closed the request'))
    const result = await streamAnswer({messages, model, connected})
    const response = result.toUIMessageStreamResponse({
      // Without this the browser only ever sees "An error occurred."
      onError: (error) => {
        log.error('[ultra-bridge] stream error:', error)
        return JSON.stringify({error: describeStreamError(error)})
      },
    })
    return key ? cacheWhileStreaming(key, response) : response
  } catch (err) {
    if (connected) await connected.close()
    if (err instanceof ConfigError) {
      log.error('[ultra-bridge] configuration problem:', err.message)
      return json(503, {error: 'The assistant is not configured yet.'})
    }
    log.error('[ultra-bridge] request failed:', err)
    return json(502, {error: 'The assistant could not reach its data source. Please try again.'})
  }
}
