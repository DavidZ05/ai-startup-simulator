import { describe, it, expect } from 'vitest'
import { checkCooldown, checkRequirements, canExecuteDecision } from '../engine/validator'
import type { Company, Decision } from '../types/game'

const mockCompany: Company = {
  name: 'TestCo',
  industry: 'AI SaaS',
  targetUsers: 'Students',
  funds: 200000,
  users: 30,
  revenue: 0,
  teamMorale: 70,
  product: 40,
  marketHeat: 5,
  competition: 10,
  burnRate: 8,
  month: 5,
  maxDecisions: 3,
  fundraisingCount: 0,
  cooldowns: { fundraising: 3 },
}

const fundraisingDecision: Decision = {
  id: 'fundraising',
  name: 'Fundraising',
  emoji: '🚀',
  description: 'Pitch to investors',
  cost: 10000,
  effects: { competition: 12 },
  category: 'finance',
  require: { product: 30, users: 20 },
  cooldown: 3,
}

const productDecision: Decision = {
  id: 'product-dev',
  name: 'Product Development',
  emoji: '💻',
  description: 'Build features',
  cost: (funds: number) => Math.round(funds * 0.12),
  effects: { product: 15 },
  category: 'core',
}

const fixedCostDecision: Decision = {
  id: 'cost-cut',
  name: 'Cost Optimization',
  emoji: '✂️',
  description: 'Cut costs',
  cost: 2000,
  effects: { burnRate: -5 },
  category: 'finance',
}

describe('checkCooldown', () => {
  it('returns true when no cooldown', () => {
    expect(checkCooldown(productDecision, mockCompany)).toBe(true)
  })

  it('returns false when on cooldown', () => {
    expect(checkCooldown(fundraisingDecision, mockCompany)).toBe(false)
  })

  it('returns true when cooldown expired', () => {
    const company = { ...mockCompany, month: 7, cooldowns: { fundraising: 3 } }
    expect(checkCooldown(fundraisingDecision, company)).toBe(true)
  })
})

describe('checkRequirements', () => {
  it('returns true when no requirements', () => {
    expect(checkRequirements(productDecision, mockCompany)).toBe(true)
  })

  it('returns true when requirements met', () => {
    expect(checkRequirements(fundraisingDecision, mockCompany)).toBe(true)
  })

  it('returns false when requirements not met', () => {
    const company = { ...mockCompany, product: 20 }
    expect(checkRequirements(fundraisingDecision, company)).toBe(false)
  })
})

describe('canExecuteDecision', () => {
  it('returns true when all conditions met', () => {
    expect(canExecuteDecision(productDecision, mockCompany)).toBe(true)
  })

  it('returns false when on cooldown', () => {
    expect(canExecuteDecision(fundraisingDecision, mockCompany)).toBe(false)
  })

  it('returns false when cannot afford', () => {
    const company = { ...mockCompany, funds: 1000 }
    expect(canExecuteDecision(fixedCostDecision, company)).toBe(false)
  })
})