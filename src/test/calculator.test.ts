import { describe, it, expect } from 'vitest'
import { clamp, applyEffects, getDecisionCost } from '../engine/calculator'
import type { Company } from '../types/game'

const mockCompany: Company = {
  name: 'TestCo',
  industry: 'AI SaaS',
  targetUsers: 'Students',
  funds: 200000,
  users: 10,
  revenue: 0,
  teamMorale: 70,
  product: 20,
  marketHeat: 5,
  competition: 10,
  burnRate: 8,
  month: 1,
  maxDecisions: 3,
  fundraisingCount: 0,
  cooldowns: {},
}

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it('clamps to min', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })
})

describe('applyEffects', () => {
  it('applies fund changes', () => {
    const result = applyEffects(mockCompany, { funds: 50000 })
    expect(result.funds).toBe(250000)
  })

  it('does not go below 0 funds', () => {
    const result = applyEffects(mockCompany, { funds: -300000 })
    expect(result.funds).toBe(0)
  })

  it('applies product changes', () => {
    const result = applyEffects(mockCompany, { product: 15 })
    expect(result.product).toBe(35)
  })

  it('clamps product to 100', () => {
    const result = applyEffects(mockCompany, { product: 90 })
    expect(result.product).toBe(100)
  })

  it('applies multiple effects', () => {
    const result = applyEffects(mockCompany, {
      users: 20,
      marketHeat: 10,
      burnRate: 2,
    })
    expect(result.users).toBe(30)
    expect(result.marketHeat).toBe(15)
    expect(result.burnRate).toBe(10)
  })
})

describe('getDecisionCost', () => {
  it('returns fixed cost', () => {
    const decision = { cost: 5000 }
    expect(getDecisionCost(decision, 200000)).toBe(5000)
  })

  it('calculates percentage cost', () => {
    const decision = { cost: (funds: number) => Math.round(funds * 0.1) }
    expect(getDecisionCost(decision, 200000)).toBe(20000)
  })
})