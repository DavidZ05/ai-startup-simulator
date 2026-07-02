import { describe, it, expect } from 'vitest'
import { getEndCondition } from '../engine/conditions'
import type { Company } from '../types/game'

const baseCompany: Company = {
  name: 'TestCo',
  industry: 'AI SaaS',
  targetUsers: 'Students',
  funds: 200000,
  users: 50,
  revenue: 20,
  teamMorale: 70,
  product: 50,
  marketHeat: 30,
  competition: 20,
  burnRate: 8,
  month: 12,
  maxDecisions: 3,
  fundraisingCount: 0,
  cooldowns: {},
}

describe('getEndCondition', () => {
  it('returns null when game continues', () => {
    expect(getEndCondition(baseCompany)).toBeNull()
  })

  it('fails when funds <= 0', () => {
    const company = { ...baseCompany, funds: 0 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('fail')
  })

  it('fails when morale <= 10', () => {
    const company = { ...baseCompany, teamMorale: 10 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('fail')
  })

  it('fails when month > 36', () => {
    const company = { ...baseCompany, month: 37 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('fail')
  })

  it('wins with product-market fit', () => {
    const company = { ...baseCompany, product: 80, users: 100, marketHeat: 60 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('success')
  })

  it('wins with unicorn status', () => {
    const company = { ...baseCompany, revenue: 50, users: 150, marketHeat: 70 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('success')
  })

  it('wins with Series A', () => {
    const company = { ...baseCompany, funds: 500000, product: 70, users: 80 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('success')
  })

  it('wins with sustainable business', () => {
    const company = { ...baseCompany, month: 24, product: 60, users: 50, funds: 100001 }
    const result = getEndCondition(company)
    expect(result?.type).toBe('success')
  })
})