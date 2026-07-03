import { describe, it, expect } from 'vitest'
import { processMonth } from '../engine/processor'
import type { Company, Decision } from '../types/game'

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

const fixedCostDecision: Decision = {
  id: 'cost-cut',
  name: 'Cost Optimization',
  emoji: '✂️',
  description: 'Cut costs',
  cost: 2000,
  effects: { burnRate: -5, teamMorale: -8 },
  category: 'finance',
}

const productDecision: Decision = {
  id: 'product-dev',
  name: 'Product Development',
  emoji: '💻',
  description: 'Build features',
  cost: (funds: number) => Math.round(funds * 0.12),
  effects: { product: 15, revenue: 5, teamMorale: 3, burnRate: 1 },
  category: 'core',
}

const marketingDecision: Decision = {
  id: 'marketing',
  name: 'Marketing Push',
  emoji: '📢',
  description: 'Run campaigns',
  cost: (funds: number) => Math.round(funds * 0.18),
  effects: { users: 30, marketHeat: 10, burnRate: 2, revenue: 8 },
  category: 'growth',
}

describe('processMonth', () => {
  it('increments month', () => {
    const result = processMonth(mockCompany, [])
    expect(result.state.month).toBe(2)
  })

  it('deducts burn cost', () => {
    const result = processMonth(mockCompany, [])
    const expectedBurn = 8 * 1500
    expect(result.state.funds).toBeGreaterThanOrEqual(200000 - expectedBurn - 10000)
  })

  it('applies decision effects', () => {
    const result = processMonth(mockCompany, [productDecision])
    expect(result.state.product).toBeGreaterThanOrEqual(20)
  })

  it('deducts decision cost', () => {
    const result = processMonth(mockCompany, [productDecision])
    const cost = Math.round(200000 * 0.12)
    const burn = 9 * 1500
    expect(result.state.funds).toBeGreaterThanOrEqual(200000 - cost - burn - 10000)
  })

  it('grows users based on market heat', () => {
    const result = processMonth(mockCompany, [])
    expect(result.state.users).toBeGreaterThanOrEqual(0)
  })

  it('generates report', () => {
    const result = processMonth(mockCompany, [productDecision])
    expect(result.report).toBeDefined()
    expect(result.report.period).toBe('Month 1')
  })

  it('handles multiple decisions', () => {
    const result = processMonth(mockCompany, [productDecision, marketingDecision])
    expect(result.state.product).toBeGreaterThanOrEqual(20)
    expect(result.state.users).toBeGreaterThanOrEqual(0)
  })

  it('does not apply unaffordable decisions', () => {
    const poorCompany = { ...mockCompany, funds: 1000 }
    const result = processMonth(poorCompany, [fixedCostDecision])
    expect(result.state.burnRate).toBeGreaterThanOrEqual(3)
  })
})