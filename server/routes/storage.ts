import { Router, Response } from 'express'
import db, { getDbSize, cleanupOldGames } from '../db'
import { authMiddleware } from './auth'

const router = Router()

interface AuthRequest extends Request {
  userId?: number
}

router.use(authMiddleware)

router.get('/stats', (req: AuthRequest, res: Response) => {
  const userGames = db.prepare('SELECT COUNT(*) as count FROM games WHERE user_id = ?').get(req.userId) as any
  const userHistory = db.prepare(`
    SELECT COUNT(*) as count FROM game_history 
    WHERE game_id IN (SELECT id FROM games WHERE user_id = ?)
  `).get(req.userId) as any

  const dbStats = getDbSize()

  res.json({
    games: userGames.count,
    historyEntries: userHistory.count,
    database: dbStats,
  })
})

router.post('/cleanup', (req: AuthRequest, res: Response) => {
  cleanupOldGames(90)
  res.json({ success: true, message: 'Cleaned up games older than 90 days' })
})

export default router