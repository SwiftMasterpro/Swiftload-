const cache = new Map<string, { count: number; reset: number }>()
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = cache.get(key)
  if (!entry || now > entry.reset) { cache.set(key, { count:1, reset:now+windowMs }); return true }
  if (entry.count >= limit) return false
  entry.count++; return true
}
export const getRateLimitKey = (req: Request, suffix: string) =>
  `${req.headers.get('x-forwarded-for')?.split(',')[0]??'unknown'}:${suffix}`
