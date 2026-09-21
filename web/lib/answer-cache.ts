// Small in-memory cache for answers to first questions, so repeated or suggested
// questions do not use up model quota. Best effort: it lives as long as the server process.
// Author: Demir Ajvazi
type Entry = {body: string; headers: [string, string][]; expires: number}

const MAX_ENTRIES = 200
const TTL_MS = 6 * 60 * 60 * 1000
const cache = new Map<string, Entry>()

export function cacheKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').replace(/[?!.\s]+$/g, '').trim()
}

export function getCached(key: string): Response | undefined {
  const hit = cache.get(key)
  if (!hit) return undefined
  if (hit.expires < Date.now()) {
    cache.delete(key)
    return undefined
  }
  // Refresh recency so popular questions stay.
  cache.delete(key)
  cache.set(key, hit)
  const headers = new Headers(hit.headers)
  headers.set('x-ultra-cache', 'hit')
  return new Response(hit.body, {status: 200, headers})
}

// Returns a response that streams to the caller unchanged and stores a copy when the
// answer finished without any error part.
export function cacheWhileStreaming(key: string, res: Response): Response {
  if (!res.body || !res.ok) return res
  const [forCaller, forCache] = res.body.tee()
  void (async () => {
    try {
      const text = await new Response(forCache).text()
      const hasText = /"type":"text-delta"/.test(text)
      const hasError = /"type":"error"/.test(text)
      if (!hasText || hasError) return
      if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string)
      cache.set(key, {body: text, headers: [...res.headers.entries()], expires: Date.now() + TTL_MS})
    } catch {
      // Caching is optional.
    }
  })()
  return new Response(forCaller, {status: res.status, headers: res.headers})
}
