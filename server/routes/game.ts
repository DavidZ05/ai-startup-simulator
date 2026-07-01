import { Router, Request, Response } from 'express'
import db from '../db'
import { authMiddleware } from './auth'

const router = Router()

interface AuthRequest extends Request {
  userId?: number
}

router.use(authMiddleware)

router.get('/', (req: AuthRequest, res: Response) => {
  const games = db.prepare(`
    SELECT id, company_name, industry, is_active, created_at, updated_at
    FROM games WHERE user_id = ? ORDER BY updated_at DESC
  `).all(req.userId)

  res.json(games)
})

router.post('/', (req: AuthRequest, res: Response) => {
  const { companyName, industry, state } = req.body

  if (!companyName || !industry || !state) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const result = db.prepare(`
    INSERT INTO games (user_id, company_name, industry, state)
    VALUES (?, ?, ?, ?)
  `).run(req.userId, companyName, industry, JSON.stringify(state))

  res.json({ id: result.lastInsertRowid, companyName, industry })
})

router.get('/:id', (req: AuthRequest, res: Response) => {
  const game = db.prepare(`
    SELECT * FROM games WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.userId) as any

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  res.json({
    ...game,
    state: JSON.parse(game.state),
  })
})

router.put('/:id', (req: AuthRequest, res: Response) => {
  const { state } = req.body

  if (!state) {
    return res.status(400).json({ error: 'Missing state' })
  }

  const result = db.prepare(`
    UPDATE games SET state = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(state), req.params.id, req.userId)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Game not found' })
  }

  res.json({ success: true })
})

router.post('/:id/history', (req: AuthRequest, res: Response) => {
  const { month, stateSnapshot, decisions, events } = req.body

  const game = db.prepare('SELECT id FROM games WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  db.prepare(`
    INSERT INTO game_history (game_id, month, state_snapshot, decisions, events)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, month, JSON.stringify(stateSnapshot), JSON.stringify(decisions), JSON.stringify(events))

  res.json({ success: true })
})

router.get('/:id/history', (req: AuthRequest, res: Response) => {
  const history = db.prepare(`
    SELECT * FROM game_history WHERE game_id = ? ORDER BY month ASC
  `).all(req.params.id)

  res.json(history.map((h: any) => ({
    ...h,
    state_snapshot: JSON.parse(h.state_snapshot),
    decisions: h.decisions ? JSON.parse(h.decisions) : null,
    events: h.events ? JSON.parse(h.events) : null,
  })))
})

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const result = db.prepare('DELETE FROM games WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Game not found' })
  }

  res.json({ success: true })
})

export default router