import { Router, Request, Response } from 'express'
import db from '../db'
import { authMiddleware } from './auth'
import { computeScore } from '../gameEngine'

const router = Router()

interface AuthRequest extends Request {
  userId?: number
}

router.get('/', (req: Request, res: Response) => {
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

/**
 * 服务端权威上榜：不接受客户端传分，从 game 终局状态重算 score。
 * 客户端只需提交 gameId 和 result；score/monthsPlayed/companyName 由服务端决定。
 */
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { gameId, result } = req.body

  if (!gameId || (result !== 'success' && result !== 'fail')) {
    return res.status(400).json({ error: 'Missing or invalid fields' })
  }

  const game = db.prepare(`
    SELECT state FROM games WHERE id = ? AND user_id = ?
  `).get(gameId, req.userId) as { state: string } | undefined

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  let state: any
  try {
    state = JSON.parse(game.state)
  } catch {
    return res.status(500).json({ error: 'Corrupted game state' })
  }

  const company = state?.company
  if (!company) {
    return res.status(400).json({ error: 'Invalid game state' })
  }

  const existing = db.prepare(`
    SELECT id FROM leaderboard WHERE user_id = ? AND game_id = ?
  `).get(req.userId, gameId)

  if (existing) {
    return res.status(409).json({ error: 'Already submitted' })
  }

  const score = computeScore(company, result)
  db.prepare(`
    INSERT INTO leaderboard (user_id, game_id, company_name, score, result, months_played)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.userId, gameId, company.name, score, result, company.month)

  db.prepare('UPDATE games SET is_active = 0 WHERE id = ? AND user_id = ?').run(gameId, req.userId)

  res.json({ success: true, score })
})

router.get('/my', authMiddleware, (req: AuthRequest, res: Response) => {
  const entries = db.prepare(`
    SELECT * FROM leaderboard WHERE user_id = ? ORDER BY score DESC
  `).all(req.userId)

  res.json(entries)
})

export default router