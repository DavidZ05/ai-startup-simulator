import type { Company, DecisionEffect } from '../types/game'
import { METRIC_LIMITS } from '../config/constants'

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function applyEffects(state: Company, effects: DecisionEffect): Company {
  const newState = { ...state }

  for (const [key, value] of Object.entries(effects)) {
    if (value === undefined) continue

    if (key === 'funds') {
      newState.funds = Math.max(0, newState.funds + value)
    } else if (key === 'burnRate') {
      const [min, max] = METRIC_LIMITS.burnRate
      newState.burnRate = clamp(newState.burnRate + value, min, max)
    } else {
      const limits = METRIC_LIMITS[key as keyof typeof METRIC_LIMITS]
      if (limits) {
        const [min, max] = limits
        const current = newState[key as keyof Company] as number
        const clamped = clamp(current + value, min, max)
        switch (key) {
          case 'users': newState.users = clamped; break
          case 'revenue': newState.revenue = clamped; break
          case 'teamMorale': newState.teamMorale = clamped; break
          case 'product': newState.product = clamped; break
          case 'marketHeat': newState.marketHeat = clamped; break
          case 'competition': newState.competition = clamped; break
        }
      }
    }
  }

  return newState
}

export function getDecisionCost(decision: { cost: number | ((funds: number) => number) }, funds: number): number {
  return typeof decision.cost === 'function' ? decision.cost(funds) : decision.cost
}