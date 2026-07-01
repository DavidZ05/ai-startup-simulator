import { Request, Response, NextFunction } from 'express'
import { GAME_CONFIG } from '../../src/config/constants'

interface GameState {
  company?: {
    funds?: number
    users?: number
    revenue?: number
    teamMorale?: number
    product?: number
    marketHeat?: number
    competition?: number
    burnRate?: number
    month?: number
  }
}

export function validateGameState(req: Request, res: Response, next: NextFunction) {
  const { state } = req.body as { state?: GameState }

  if (!state || !state.company) {
    return next()
  }

  const { company } = state

  if (typeof company.funds !== 'number' || company.funds < 0 || company.funds > 1000000) {
    return res.status(400).json({ error: 'Invalid funds value' })
  }

  if (typeof company.users !== 'number' || company.users < 0 || company.users > 1000) {
    return res.status(400).json({ error: 'Invalid users value' })
  }

  if (typeof company.revenue !== 'number' || company.revenue < 0 || company.revenue > 100) {
    return res.status(400).json({ error: 'Invalid revenue value' })
  }

  if (typeof company.teamMorale !== 'number' || company.teamMorale < 0 || company.teamMorale > 100) {
    return res.status(400).json({ error: 'Invalid team morale value' })
  }

  if (typeof company.product !== 'number' || company.product < 0 || company.product > 100) {
    return res.status(400).json({ error: 'Invalid product value' })
  }

  if (typeof company.marketHeat !== 'number' || company.marketHeat < 0 || company.marketHeat > 100) {
    return res.status(400).json({ error: 'Invalid market heat value' })
  }

  if (typeof company.competition !== 'number' || company.competition < 0 || company.competition > 100) {
    return res.status(400).json({ error: 'Invalid competition value' })
  }

  if (typeof company.month !== 'number' || company.month < 1 || company.month > 37) {
    return res.status(400).json({ error: 'Invalid month value' })
  }

  next()
}