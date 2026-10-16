import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import type { GameDatabase } from '../db'

declare global {
  namespace Express {
    interface Request { userId?: number }
  }
}

export function createAuthMiddleware(db: GameDatabase, secret: string): RequestHandler {
  return (req, res, next) => {
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '')
    if (!match) return void res.status(401).json({error:'Authentication required'})
    try {
      const decoded = jwt.verify(match[1], secret, {algorithms:['HS256']})
      if (typeof decoded === 'string' || !Number.isSafeInteger(decoded.userId) || decoded.userId <= 0 ||
        !db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId)) {
        return void res.status(401).json({error:'Invalid token'})
      }
      req.userId = decoded.userId
      next()
    } catch {
      res.status(401).json({error:'Invalid or expired token'})
    }
  }
}
