import { Router, Request, Response } from 'express'
import db, { deleteUserGameData } from '../db'
import { authMiddleware } from './auth'
import { validateGameState } from '../middleware/validateState'
import { settleTurn, purchase, computeScore } from '../gameEngine'

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

router.put('/:id', validateGameState, (req: AuthRequest, res: Response) => {
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

/**
 * 服务端权威回合结算：客户端只提交 decision ids，
 * processMonth 在服务端执行（随机事件/新闻/竞争对手也由服务端掷骰），
 * 结算结果直接落库并返回给客户端渲染。
 */
router.post('/:id/turn', (req: AuthRequest, res: Response) => {
  const game = db.prepare(`
    SELECT state FROM games WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.userId) as { state: string } | undefined

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  let savedState: unknown
  try {
    savedState = JSON.parse(game.state)
  } catch {
    return res.status(500).json({ error: 'Corrupted game state' })
  }

  const settled = settleTurn(savedState, req.body?.decisions)
  if (!settled.ok) {
    return res.status(400).json({ error: settled.error })
  }

  db.prepare(`
    UPDATE games SET state = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(settled.newState), req.params.id, req.userId)

  // 终局 → 服务端权威算分写入排行榜（不接受客户端传分）
  if (settled.result.endCondition) {
    const end = settled.result.endCondition
    const company = settled.result.state
    const score = computeScore(company, end.type)
    const existing = db.prepare(`
      SELECT id FROM leaderboard WHERE user_id = ? AND game_id = ?
    `).get(req.userId, req.params.id)
    if (!existing) {
      db.prepare(`
        INSERT INTO leaderboard (user_id, game_id, company_name, score, result, months_played)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.userId, req.params.id, company.name, score, end.type, company.month)
      db.prepare('UPDATE games SET is_active = 0 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
    }
  }

  res.json(settled.result)
})

/**
 * 服务端权威购买结算：科技/市场/雇员统一入口，客户端只提交 { type, id }。
 */
router.post('/:id/purchase', (req: AuthRequest, res: Response) => {
  const game = db.prepare(`
    SELECT state FROM games WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.userId) as { state: string } | undefined

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  let savedState: unknown
  try {
    savedState = JSON.parse(game.state)
  } catch {
    return res.status(500).json({ error: 'Corrupted game state' })
  }

  const { type, id } = req.body || {}
  const result = purchase(savedState, type, id)
  if (!result.ok) {
    return res.status(400).json({ error: result.error })
  }

  const newState = { ...(savedState as any), company: result.company }
  db.prepare(`
    UPDATE games SET state = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(newState), req.params.id, req.userId)

  res.json({ success: true, company: result.company })
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

router.delete('/user/all', (req: AuthRequest, res: Response) => {
  deleteUserGameData(req.userId!)
  res.json({ success: true, message: 'All user data deleted' })
})

export default router