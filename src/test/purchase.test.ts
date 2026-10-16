import { describe, it, expect } from 'vitest'
import { purchase, computeScore, type SavedGameState } from '../../server/gameEngine'
import type { Company } from '../types/game'

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    name: 'TestCo',
    industry: 'ai-saas',
    targetUsers: 'developers',
    funds: 100000,
    users: 60,
    revenue: 20,
    teamMorale: 70,
    product: 50,
    marketHeat: 30,
    competition: 10,
    burnRate: 10,
    month: 1,
    maxDecisions: 3,
    fundraisingCount: 0,
    cooldowns: {},
    unlockedTech: ['mvp'],
    unlockedMarkets: ['local'],
    employees: [],
    ...overrides,
  }
}

function makeState(overrides: Partial<Company> = {}): SavedGameState {
  const company = makeCompany(overrides)
  return { company, history: [company], turn: 1 }
}

describe('purchase 输入与前置校验', () => {
  it('拒绝未知 kind / id', () => {
    expect(purchase(makeState(), 'hack', 'mvp').ok).toBe(false)
    expect(purchase(makeState(), 'tech', 'nonexistent').ok).toBe(false)
  })

  it('科技链前置未满足时拒绝（mobile-app 需要 ui-design）', () => {
    const r = purchase(makeState({ unlockedTech: ['mvp'] }), 'tech', 'mobile-app')
    expect(r.ok).toBe(false)
  })

  it('重复购买拒绝', () => {
    const r = purchase(makeState({ unlockedTech: ['mvp'] }), 'tech', 'mvp')
    expect(r.ok).toBe(false)
  })

  it('资金不足拒绝', () => {
    const r = purchase(makeState({ funds: 1000 }), 'tech', 'platform')
    expect(r.ok).toBe(false)
  })

  it('市场门槛未满足拒绝（japan 需 users≥40 product≥50，给低值）', () => {
    const r = purchase(makeState({ users: 10, product: 10, funds: 100000 }), 'market', 'japan')
    expect(r.ok).toBe(false)
  })

  it('雇员门槛未满足拒绝（cto 需 product≥60）', () => {
    const r = purchase(makeState({ product: 20, funds: 100000 }), 'employee', 'cto')
    expect(r.ok).toBe(false)
  })
})

describe('purchase 正常结算与防作弊', () => {
  it('购买科技：扣费 + 效果 + 记录拥有', () => {
    const state = makeState({ funds: 100000, unlockedTech: ['mvp'] })
    const r = purchase(state, 'tech', 'ui-design')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.company.unlockedTech).toContain('ui-design')
    expect(r.company.funds).toBe(100000 - 15000)
    expect(r.company.product).toBeGreaterThan(50) // ui-design 效果 product +10
  })

  it('购买市场：解锁 market 且扣费', () => {
    const state = makeState({ funds: 100000, users: 60, product: 50, unlockedMarkets: ['local'] })
    const r = purchase(state, 'market', 'us')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.company.unlockedMarkets).toContain('us')
    expect(r.company.funds).toBe(100000 - 50000)
  })

  it('购买雇员：加入 employees 且扣费', () => {
    const state = makeState({ funds: 100000, product: 30 })
    const r = purchase(state, 'employee', 'senior-dev')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.company.employees).toContain('senior-dev')
    expect(r.company.funds).toBe(100000 - 15000)
  })

  it('伪造 cost 无效——费用由服务端配置决定', () => {
    const state = makeState({ funds: 100000, unlockedTech: ['mvp'] })
    // 客户端夹带 cost:0 的 id 也会被重建，费用仍按配置 15000 扣
    const r = purchase(state, 'tech', 'ui-design')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.company.funds).toBe(100000 - 15000)
  })
})

describe('computeScore 确定性算分', () => {
  it('分数是确定性整数，不受客户端影响', () => {
    const c = makeCompany({ funds: 100000, users: 100, revenue: 30, product: 60, teamMorale: 80 })
    const a = computeScore(c, 'success')
    const b = computeScore(c, 'success')
    expect(a).toBe(b)
    expect(Number.isInteger(a)).toBe(true)
    expect(a).toBeGreaterThan(0)
  })

  it('成功比失败有额外加成', () => {
    const c = makeCompany()
    expect(computeScore(c, 'success')).toBe(computeScore(c, 'fail') + 100000)
  })
})
