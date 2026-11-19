import 'server-only'

// Per person and per server instance: enough to stop a runaway loop without a shared store.
const hits = new Map<string, number[]>()

/** True when `key` may go ahead: at most `limit` calls per `windowMs`. */
export function allow(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) { hits.set(key, recent); return false }
  recent.push(now)
  hits.set(key, recent)
  return true
}
