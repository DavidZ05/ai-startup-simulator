import { Request, Response, NextFunction } from 'express'

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

const LIMITS = {
  funds: [0, 1000000],
  users: [0, 1000],
  revenue: [0, 100],
  teamMorale: [0, 100],
  product: [0, 100],
  marketHeat: [0, 100],
  competition: [0, 100],
  burnRate: [1, 100],
  month: [1, 37],
}

export function validateGameState(req: Request, res: Response, next: NextFunction) {
  const { state } = req.body as { state?: GameState }

  if (!state || !state.company) {
    return next()
  }

  const { company } = state

  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = company[key as keyof typeof company]
    if (typeof value !== 'number' || value < min || value > max) {
      return res.status(400).json({ error: `Invalid ${key} value` })
    }
  }

  next()
}