import { describe, it, expect } from 'vitest'
import { settleTurn, type SavedGameState } from '../../server/gameEngine'
import type { Company } from '../types/game'

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    name: 'TestCo',
    industry: 'ai-saas',
    targetUsers: 'developers',
    funds: 100000,
    users: 10,
    revenue: 5,
    teamMorale: 70,
    product: 30,
    marketHeat: 20,
    competition: 10,
    burnRate: 10,
    month: 1,
    maxDecisions: 3,
    fundraisingCount: 0,
    cooldowns: {},
    ...overrides,
  }
}

function makeSavedState(overrides: Partial<SavedGameState> = {}): SavedGameState {
  const company = makeCompany()
  return { company, history: [company], turn: 1, ...overrides }
}

describe('settleTurn 输入校验', () => {
  it('拒绝非数组的 decisions', () => {
    const r = settleTurn(makeSavedState(), 'product-dev')
    expect(r.ok).toBe(false)
  })

  it('拒绝空决策', () => {
    const r = settleTurn(makeSavedState(), [])
    expect(r.ok).toBe(false)
  })

  it('拒绝超过 maxDecisions 的决策数', () => {
    const r = settleTurn(makeSavedState(), [
      { id: 'product-dev' }, { id: 'marketing' }, { id: 'hiring' }, { id: 'cost-cut' },
    ])
    expect(r.ok).toBe(false)
  })

  it('拒绝未知 decision id', () => {
    const r = settleTurn(makeSavedState(), [{ id: 'give-me-money' }])
    expect(r.ok).toBe(false)
  })

  it('拒绝重复 decision id', () => {
    const r = settleTurn(makeSavedState(), [{ id: 'product-dev' }, { id: 'product-dev' }])
    expect(r.ok).toBe(false)
  })

  it('拒绝缺失 game state / company', () => {
    expect(settleTurn({} as SavedGameState, [{ id: 'product-dev' }]).ok).toBe(false)
    expect(settleTurn(null as unknown as SavedGameState, [{ id: 'product-dev' }]).ok).toBe(false)
  })
})

describe('settleTurn 防作弊', () => {
  it('伪造的 effects 字段被忽略——只按服务端配置的效果结算', () => {
    const saved = makeSavedState()
    const fundsBefore = saved.company!.funds

    // 客户端伪造：id 合法，但夹带私货 effects { funds: +999999 }
    const forged = [{ id: 'product-dev', effects: { funds: 999999 } }]

    const r = settleTurn(saved, forged)
    expect(r.ok).toBe(true)
    if (!r.ok) return

    // product-dev 真实效果：product +15, 无 funds 增益（还要扣成本和 burn）
    expect(r.result.state.funds).toBeLessThan(fundsBefore)
    expect(r.result.state.product).toBeGreaterThanOrEqual(15)
  })

  it('伪造的 cost/dynamicEffect 字段同样被丢弃', () => {
    const saved = makeSavedState()
    const fundsBefore = saved.company!.funds

    const forged = [{
      id: 'product-dev',
      cost: 0,
      dynamicEffect: () => ({ funds: 500000 }),
      effects: { funds: 500000 },
    }]

    const r = settleTurn(saved, forged)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.result.state.funds).toBeLessThan(fundsBefore)
  })
})

describe('settleTurn 正常结算', () => {
  it('月份数推进、turn 递增、新状态追加进 history', () => {
    const saved = makeSavedState()
    const r = settleTurn(saved, [{ id: 'product-dev' }])

    expect(r.ok).toBe(true)
    if (!r.ok) return

    expect(r.result.state.month).toBe(2)
    expect(r.newState.turn).toBe(2)
    expect(r.newState.company).toBe(r.result.state)
    expect(r.newState.history!.length).toBe(saved.history!.length + 1)
    expect(r.newState.history![r.newState.history!.length - 1]).toBe(r.result.state)
  })

  it('返回的 MonthResult 带完整报告结构', () => {
    const r = settleTurn(makeSavedState(), [{ id: 'marketing' }])
    expect(r.ok).toBe(true)
    if (!r.ok) return

    expect(r.result.report).toHaveProperty('period')
    expect(r.result.report).toHaveProperty('decisionSummary')
    expect(typeof r.result.report.burnCost).toBe('number')
    expect(['success', 'fail', null]).toEqual(
      expect.arrayContaining([r.result.endCondition?.type ?? null]),
    )
  })
})
