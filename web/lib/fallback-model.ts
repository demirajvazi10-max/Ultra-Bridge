// A language model that tries several providers in order.
// If a provider fails, or stays silent for too long, before it has produced any output
// (rate limit, outage, bad key, stalled connection), the next one is tried. Once a provider
// has started answering, its stream is used as is.
// Author: Demir Ajvazi
import type {LanguageModelV3, LanguageModelV3StreamPart} from '@ai-sdk/provider'

const PREAMBLE_PARTS = new Set(['stream-start', 'response-metadata'])

function cooldownMs(error: unknown): number {
  const status = (error as {statusCode?: number})?.statusCode
  if (status === 401 || status === 403 || status === 404) return 10 * 60_000 // wrong key or model: retrying will not help
  if (status === 429) return 60_000 // rate limited: the per minute window has to pass
  return 30_000
}

export type FallbackOptions = {
  onFallback?: (failed: LanguageModelV3, error: unknown, next: LanguageModelV3 | undefined) => void
  /** How long a provider may stay silent before the next one is tried. */
  firstOutputTimeoutMs?: number
  /** How long a failed provider is skipped. Defaults depend on the error. */
  cooldownMs?: (error: unknown) => number
}

function withDeadline<T>(promise: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout()
      reject(new Error(`no output within ${Math.round(ms / 1000)} s`))
    }, ms)
  })
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer))
}

export function createFallbackModel(models: LanguageModelV3[], options: FallbackOptions = {}): LanguageModelV3 {
  if (models.length === 0) throw new Error('createFallbackModel needs at least one model.')
  const timeoutMs = options.firstOutputTimeoutMs ?? 25_000
  // A provider that just failed is skipped for a while, so later questions do not wait for
  // it or spend quota on it. If every provider is cooling down, all are tried again.
  const coolingUntil = new Map<LanguageModelV3, number>()
  const order = (): LanguageModelV3[] => {
    const now = Date.now()
    const ready = models.filter((m) => (coolingUntil.get(m) ?? 0) <= now)
    return ready.length ? ready : models
  }
  const failOver = (failed: LanguageModelV3, list: LanguageModelV3[], index: number, error: unknown) => {
    coolingUntil.set(failed, Date.now() + (options.cooldownMs ?? cooldownMs)(error))
    options.onFallback?.(failed, error, list[index + 1])
  }

  return {
    specificationVersion: 'v3',
    provider: 'ultra-fallback',
    modelId: models.map((m) => m.modelId).join(' > '),
    supportedUrls: models[0].supportedUrls,

    async doGenerate(callOptions) {
      let lastError: unknown
      const list = order()
      for (const [i, model] of list.entries()) {
        const attempt = new AbortController()
        const signal = callOptions.abortSignal ? AbortSignal.any([callOptions.abortSignal, attempt.signal]) : attempt.signal
        try {
          return await withDeadline(Promise.resolve(model.doGenerate({...callOptions, abortSignal: signal})), timeoutMs * 2, () => attempt.abort())
        } catch (error) {
          if (callOptions.abortSignal?.aborted) throw error
          lastError = error
          failOver(model, list, i, error)
        }
      }
      throw lastError
    },

    async doStream(callOptions) {
      let lastError: unknown
      const list = order()
      for (const [i, model] of list.entries()) {
        const attempt = new AbortController()
        const signal = callOptions.abortSignal ? AbortSignal.any([callOptions.abortSignal, attempt.signal]) : attempt.signal
        try {
          const started = (async () => {
            const result = await model.doStream({...callOptions, abortSignal: signal})
            const reader = result.stream.getReader()
            const buffered: LanguageModelV3StreamPart[] = []
            let streamEnded = false
            // Read until the first real output, so a stream that fails right away can be replaced.
            while (true) {
              const {done, value} = await reader.read()
              if (done) {
                streamEnded = true
                break
              }
              if (value.type === 'error') throw value.error
              buffered.push(value)
              if (!PREAMBLE_PARTS.has(value.type)) break
            }
            return {result, reader, buffered, streamEnded}
          })()

          const {result, reader, buffered, streamEnded} = await withDeadline(started, timeoutMs, () => attempt.abort())

          const stream = new ReadableStream<LanguageModelV3StreamPart>({
            start(controller) {
              for (const part of buffered) controller.enqueue(part)
              if (streamEnded) controller.close()
            },
            async pull(controller) {
              if (streamEnded) return
              const {done, value} = await reader.read()
              if (done) controller.close()
              else controller.enqueue(value)
            },
            cancel(reason) {
              return reader.cancel(reason)
            },
          })
          return {...result, stream}
        } catch (error) {
          if (callOptions.abortSignal?.aborted) throw error
          lastError = error
          failOver(model, list, i, error)
        }
      }
      throw lastError
    },
  }
}
