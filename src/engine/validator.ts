import type { Decision, Company } from '../types/game'
import { getDecisionCost } from './calculator'

export function checkCooldown(decision: Decision, state: Company): boolean {
  if (!decision.cooldown) return true
  const lastUsed = state.cooldowns?.[decision.id] || 0
  return (state.month - lastUsed) >= decision.cooldown
}

export function checkRequirements(decision: Decision, state: Company): boolean {
  if (!decision.require) return true

  for (const [key, minValue] of Object.entries(decision.require)) {
    const value = state[key as keyof Company]
    if (typeof value === 'number' && value < minValue) return false
  }

  return true
}

export function canExecuteDecision(decision: Decision, state: Company): boolean {
  const cost = getDecisionCost(decision, state.funds)
  return (
    state.funds >= cost &&
    checkCooldown(decision, state) &&
    checkRequirements(decision, state)
  )
}