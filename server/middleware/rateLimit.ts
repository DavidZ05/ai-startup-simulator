import type { RequestHandler } from 'express'

// Per-app state, lazily pruned: no global interval or background handle.
export function createRateLimiter(maxRequests = 120, windowMs = 60000): RequestHandler {
  const entries = new Map<string,{count:number;reset:number}>()
  return (req,res,next) => {
    const now = Date.now()
    for (const [ip,entry] of entries) if (now >= entry.reset) entries.delete(ip)
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const entry = entries.get(key) || {count:0,reset:now + windowMs}
    if (entry.count >= maxRequests) {
      res.set('Retry-After',String(Math.max(1,Math.ceil((entry.reset-now)/1000))))
      return void res.status(429).json({error:'Too many requests. Please try again later.'})
    }
    entry.count++
    entries.set(key,entry)
    next()
  }
}
