import { Router, type RequestHandler } from 'express'
import type { GameDatabase } from '../db'

export function createLeaderboardRouter(db: GameDatabase, authenticate: RequestHandler) {
  const router = Router()
  router.get('/',(req,res) => {
    const parsed = Number(req.query.limit || 20)
    const limit = Number.isFinite(parsed) ? Math.min(100,Math.max(1,Math.floor(parsed))) : 20
    res.json(db.prepare(`SELECT l.id,l.company_name,l.score,l.result,l.months_played,l.created_at,u.username
      FROM leaderboard l JOIN users u ON l.user_id=u.id ORDER BY l.score DESC,l.id LIMIT ?`).all(limit))
  })
  router.use(authenticate)
  router.post('/',(_req,res) => res.status(405).json({error:'Scores are recorded automatically when a game ends'}))
  router.get('/my',(req,res) => res.json(db.prepare('SELECT * FROM leaderboard WHERE user_id=? ORDER BY score DESC').all(req.userId)))
  return router
}
