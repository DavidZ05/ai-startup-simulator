import { processMonth } from './processor'
import { DECISIONS } from '../config/decisions'
import { TECH_TREE } from '../config/techTree'
import { MARKETS } from '../config/markets'
import { EMPLOYEE_ROLES } from '../config/employees'
import { applyEffects, getDecisionCost } from './calculator'
import { canExecuteDecision } from './validator'
import type { Company, Decision, DecisionEffect, MonthResult } from '../types/game'

/**
 * 服务端回合结算（防作弊核心）。
 *
 * 客户端只提交 decision id 列表；效果、费用、动态效果全部从服务端
 * 持有的 DECISIONS 配置重建，绝不信任请求体里的 effects/cost 字段。
 */

export interface SavedGameState {
  company?: Company
  history?: Company[]
  turn?: number
  [key: string]: unknown
}

export type SettleTurnResult =
  | { ok: true; result: MonthResult; newState: SavedGameState }
  | { ok: false; error: string }

const DEFAULT_MAX_DECISIONS = 3

export function settleTurn(savedState: unknown, requestedDecisions: unknown): SettleTurnResult {
  if (!savedState || typeof savedState !== 'object' || !('company' in savedState)) {
    return { ok: false, error: 'Invalid game state' }
  }

  if (!Array.isArray(requestedDecisions)) {
    return { ok: false, error: 'Decisions must be an array' }
  }

  const { company, history: savedHistory, turn } = savedState as SavedGameState

  if (!company) {
    return { ok: false, error: 'Invalid game state' }
  }
  const maxDecisions = company.maxDecisions || DEFAULT_MAX_DECISIONS

  if (requestedDecisions.length === 0) {
    return { ok: false, error: 'At least one decision is required' }
  }
  if (requestedDecisions.length > maxDecisions) {
    return { ok: false, error: `At most ${maxDecisions} decisions per turn` }
  }

  // 只认 id，从服务端配置重建规范 Decision（丢弃客户端伪造的 effects/cost/dynamicEffect）
  const decisions: Decision[] = []
  const seen = new Set<string>()
  for (const item of requestedDecisions) {
    const id = (item as { id?: unknown } | null)?.id
    if (typeof id !== 'string') {
      return { ok: false, error: 'Each decision must have a string id' }
    }
    const canonical = DECISIONS.find(d => d.id === id)
    if (!canonical) {
      return { ok: false, error: `Unknown decision: ${id}` }
    }
    if (seen.has(id)) {
      return { ok: false, error: `Duplicate decision: ${id}` }
    }
    seen.add(id)
    decisions.push(canonical)
  }

  // Validate the complete plan in execution order before spending anything.
  let planned = {...company, cooldowns:{...company.cooldowns}}
  for (const decision of decisions) {
    if (!canExecuteDecision(decision,planned)) return {ok:false,error:`Decision unavailable: ${decision.name}`}
    planned = {...planned,funds:planned.funds-getDecisionCost(decision,planned.funds)}
    planned = applyEffects(planned,{...decision.effects,...decision.dynamicEffect?.(planned)})
  }

  const history = Array.isArray(savedHistory) ? savedHistory : [company]
  const result = processMonth(company, decisions, history)

  const newState: SavedGameState = {
    ...(savedState as SavedGameState),
    company: result.state,
    history: [...history, result.state],
    turn: (turn || 1) + 1,
  }

  return { ok: true, result, newState }
}

/**
 * 服务端权威购买结算：科技解锁 / 市场扩张 / 雇员招聘统一走这里。
 * 客户端只提交 { type, id }，费用、前置条件、效果全部从服务端配置重建，
 * 绝不信任客户端传来的 cost / effects。
 */

export type PurchaseKind = 'tech' | 'market' | 'employee'

export type PurchaseResult =
  | { ok: true; company: Company }
  | { ok: false; error: string }

interface PurchaseDef {
  id: string
  cost: number
  requires?: string[]
  unlockRequirement?: { users?: number; product?: number; funds?: number }
  require?: Record<string, number>
  effects: DecisionEffect
}

function meetRequirement(company: Company, req?: Record<string, number>): boolean {
  if (!req) return true
  return Object.entries(req).every(([k, v]) => (company[k as keyof Company] as number) >= v)
}

export function purchase(savedState: unknown, kind: unknown, id: unknown): PurchaseResult {
  if (!savedState || typeof savedState !== 'object' || !('company' in savedState)) {
    return { ok: false, error: 'Invalid game state' }
  }
  const company = (savedState as SavedGameState).company
  if (!company) {
    return { ok: false, error: 'Invalid game state' }
  }
  if (typeof kind !== 'string' || typeof id !== 'string') {
    return { ok: false, error: 'Invalid purchase request' }
  }

  const def: PurchaseDef | undefined = (() => {
    switch (kind as PurchaseKind) {
      case 'tech':
        return TECH_TREE.find(t => t.id === id)
      case 'market':
        return MARKETS.find(m => m.id === id)
      case 'employee':
        return EMPLOYEE_ROLES.find(e => e.id === id)
      default:
        return undefined
    }
  })()
  if (!def) {
    return { ok: false, error: `Unknown ${kind}: ${id}` }
  }

  // 前置科技链
  if (def.requires && def.requires.length > 0) {
    const unlocked = company.unlockedTech || []
    for (const req of def.requires) {
      if (!unlocked.includes(req)) {
        return { ok: false, error: `Requires ${req} first` }
      }
    }
  }

  // 重复购买 / 已拥有
  const owned = (() => {
    switch (kind as PurchaseKind) {
      case 'tech': return company.unlockedTech?.includes(id)
      case 'market': return company.unlockedMarkets?.includes(id)
      case 'employee': return company.employees?.includes(id)
    }
  })()
  if (owned) {
    return { ok: false, error: `Already own ${id}` }
  }

  // 门槛（市场 unlockRequirement / 雇员 require）
  if (kind === 'market' && def.unlockRequirement) {
    if (!meetRequirement(company, def.unlockRequirement)) {
      return { ok: false, error: 'Requirements not met' }
    }
  }
  if (kind === 'employee' && def.require) {
    if (!meetRequirement(company, def.require)) {
      return { ok: false, error: 'Requirements not met' }
    }
  }

  // 费用
  if (company.funds < def.cost) {
    return { ok: false, error: 'Insufficient funds' }
  }

  // 应用：扣费 + 效果 + 记录拥有
  let next: Company = { ...company, funds: company.funds - def.cost }
  next = applyEffects(next, def.effects)
  switch (kind as PurchaseKind) {
    case 'tech':
      next.unlockedTech = [...(company.unlockedTech || []), id]
      break
    case 'market':
      next.unlockedMarkets = [...(company.unlockedMarkets || []), id]
      break
    case 'employee':
      next.employees = [...(company.employees || []), id]
      break
  }

  return { ok: true, company: next }
}

/**
 * 服务端权威分数计算：从终局 company 状态重算，不接受客户端传分。
 * 公式：funds 贡献 + users 贡献 + revenue 贡献 + product 贡献 + morale 贡献，
 * 全部为确定性的整数四则运算。
 */
export function computeScore(company: Company, result: 'success' | 'fail'): number {
  const funds = Math.max(0, company.funds)
  const score =
    Math.floor(funds / 1000) +
    company.users * 10 +
    company.revenue * 100 +
    company.product * 50 +
    company.teamMorale * 20
  const successBonus = result === 'success' ? 100000 : 0
  return score + successBonus
}
