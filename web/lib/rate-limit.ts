// Minimal in-memory rate limiter to protect a public demo. Per instance, best effort.
// Author: Demir Ajvazi
const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs = 60_000): {ok: boolean; retryAfterSeconds: number} {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return {ok: false, retryAfterSeconds: Math.ceil((windowMs - (now - recent[0])) / 1000)}
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return {ok: true, retryAfterSeconds: 0}
}
