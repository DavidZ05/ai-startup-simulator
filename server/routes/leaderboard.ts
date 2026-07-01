import { Router, Response } from 'express'
import db from '../db'
import { authMiddleware } from './auth'

const router = Router()

interface AuthRequest extends Request {
  userId?: number
}

router.get('/', (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)

  const leaderboard = db.prepare(`
    SELECT l.*, u.username
    FROM leaderboard l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.score DESC
    LIMIT ?
  `).all(limit)

  res.json(leaderboard)
})

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { gameId, companyName, score, result, monthsPlayed } = req.body

  if (!gameId || !companyName || score === undefined || !result || !monthsPlayed) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const existing = db.prepare(`
    SELECT id FROM leaderboard WHERE user_id = ? AND game_id = ?
  `).get(req.userId, gameId)

  if (existing) {
    return res.status(409).json({ error: 'Already submitted' })
  }

  db.prepare(`
    INSERT INTO leaderboard (user_id, game_id, company_name, score, result, months_played)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.userId, gameId, companyName, score, result, monthsPlayed)

  res.json({ success: true })
})

router.get('/my', authMiddleware, (req: AuthRequest, res: Response) => {
  const entries = db.prepare(`
    SELECT * FROM leaderboard WHERE user_id = ? ORDER BY score DESC
  `).all(req.userId)

  res.json(entries)
})

export default router