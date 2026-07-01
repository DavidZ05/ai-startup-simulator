import { DECISIONS, EVENTS, getEndCondition, INITIAL_COMPANY } from './decisions.js'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function cloneState(state) {
  return { ...state, cooldowns: state.cooldowns ? { ...state.cooldowns } : {} }
}

function applyEffects(state, effects) {
  const s = cloneState(state)
  for (const [key, value] of Object.entries(effects)) {
    if (key === 'funds') {
      s.funds = Math.max(0, s.funds + value)
    } else if (key === 'burnRate') {
      s.burnRate = clamp(s.burnRate + value, 1, 100)
    } else {
      const limits = { users: [0, 1000], revenue: [0, 100], teamMorale: [0, 100], product: [0, 100], marketHeat: [0, 100], competition: [0, 100] }
      const [min, max] = limits[key] || [0, 100]
      s[key] = clamp(s[key] + value, min, max)
    }
  }
  return s
}

function checkCooldown(decision, state) {
  if (!decision.cooldown) return true
  const lastUsed = state.cooldowns?.[decision.id] || 0
  return (state.month - lastUsed) >= decision.cooldown
}

function checkRequirements(decision, state) {
  if (!decision.require) return true
  for (const [key, minValue] of Object.entries(decision.require)) {
    if ((state[key] || 0) < minValue) return false
  }
  return true
}

function processMonth(state, decisions) {
  let s = cloneState(state)

  for (const decision of decisions) {
    const cost = typeof decision.cost === 'function' ? decision.cost(s.funds) : decision.cost
    if (s.funds < cost) continue
    if (!checkCooldown(decision, s)) continue
    if (!checkRequirements(decision, s)) continue

    s.funds -= cost

    let effects = { ...decision.effects }
    if (decision.dynamicEffect) {
      const dynamic = decision.dynamicEffect(s)
      effects = { ...effects, ...dynamic }
    }

    s = applyEffects(s, effects)

    if (decision.id === 'fundraising') {
      s.fundraisingCount = (s.fundraisingCount || 0) + 1
      if (!s.cooldowns) s.cooldowns = {}
      s.cooldowns[decision.id] = s.month
    }
  }

  const burnCost = Math.round(s.burnRate * 2000)
  s.funds = Math.max(0, s.funds - burnCost)

  const revenueGrowth = s.revenue > 0 ? Math.round(s.users * 0.02) : 0
  s.revenue = clamp(s.revenue + revenueGrowth, 0, 100)

  const userGrowth = Math.round(s.marketHeat * 0.3)
  s.users = clamp(s.users + userGrowth, 0, 1000)

  if (s.burnRate > 30) {
    s.teamMorale = clamp(s.teamMorale - 3, 0, 100)
  }

  if (s.competition > 50) {
    s.marketHeat = clamp(s.marketHeat - 2, 0, 100)
  }

  s.month += 1
  return s
}

function runSimulation(name, strategy, maxMonths = 36) {
  let state = cloneState(INITIAL_COMPANY)
  state.name = 'TestCo'
  state.industry = 'AI SaaS'

  const history = []

  for (let m = 0; m < maxMonths; m++) {
    const decisions = strategy(state)
    state = processMonth(state, decisions)

    const end = getEndCondition(state)
    history.push({
      month: state.month,
      funds: state.funds,
      users: state.users,
      product: state.product,
      heat: state.marketHeat,
      competition: state.competition,
      morale: state.teamMorale,
      burnRate: state.burnRate,
      revenue: state.revenue,
      burnCost: state.burnRate * 2000,
    })

    if (end) {
      return { name, result: end.type, reason: end.reason, months: state.month, history }
    }
  }

  return { name, result: 'timeout', reason: 'Reached 36 months without winning', months: 36, history }
}

// === STRATEGIES TO TEST ===

const find = (id) => DECISIONS.find(d => d.id === id)

// Strategy 1: Pure cost optimization spam
const costOptSpam = (state) => {
  const costOpt = find('cost-cut')
  return [costOpt, costOpt, costOpt]
}

// Strategy 2: Pure user research spam
const researchSpam = (state) => {
  const research = find('user-research')
  return [research, research, research]
}

// Strategy 3: Research → Marketing → Partnerships (balanced growth)
const balancedGrowth = (state) => {
  if (state.product < 40) return [find('user-research'), find('product-dev'), find('user-research')]
  if (state.marketHeat < 30) return [find('marketing'), find('partnerships'), find('user-research')]
  return [find('marketing'), find('partnerships'), find('fundraising')]
}

// Strategy 4: Research → Fundraising spam
const researchThenFundraise = (state) => {
  if (state.product < 30 || state.users < 20) return [find('user-research'), find('product-dev'), find('user-research')]
  return [find('fundraising'), find('marketing'), find('product-dev')]
}

// Strategy 5: Pure fundraising (should be blocked now)
const pureFundraise = (state) => {
  if (state.product < 30 || state.users < 20) return [find('user-research'), find('product-dev'), find('user-research')]
  return [find('fundraising'), find('fundraising'), find('fundraising')]
}

// Strategy 6: Cost optimization + Research (low burn strategy)
const lowBurn = (state) => {
  if (state.burnRate > 5) return [find('cost-cut'), find('user-research'), find('product-dev')]
  return [find('user-research'), find('product-dev'), find('marketing')]
}

// Strategy 7: Partnerships only (keep competition low)
const partnershipsOnly = (state) => {
  return [find('partnerships'), find('partnerships'), find('user-research')]
}

// Strategy 8: Pivot spam (highest heat boost)
const pivotSpam = (state) => {
  return [find('pivot'), find('pivot'), find('pivot')]
}

// Strategy 9: Hiring + Product (team building)
const teamBuilding = (state) => {
  return [find('hiring'), find('product-dev'), find('user-research')]
}

// Strategy 10: Optimal play (what a good player would do)
const optimalPlay = (state) => {
  const picks = []

  if (state.product < 50) picks.push(find('product-dev'))
  if (state.marketHeat < 40) picks.push(find('marketing'))
  if (state.teamMorale < 60) picks.push(find('hiring'))
  if (state.product >= 30 && state.users >= 20) picks.push(find('fundraising'))
  if (state.competition > 40) picks.push(find('partnerships'))
  if (picks.length < 3) picks.push(find('user-research'))
  if (picks.length < 3) picks.push(find('partnerships'))

  return picks.slice(0, 3)
}

// === RUN ALL SIMULATIONS ===
console.log('=== AI Startup Simulator — Balance Test ===\n')

const strategies = [
  ['Pure Cost Optimization Spam', costOptSpam],
  ['Pure User Research Spam', researchSpam],
  ['Balanced Growth', balancedGrowth],
  ['Research → Fundraising', researchThenFundraise],
  ['Pure Fundraising (exploit test)', pureFundraise],
  ['Low Burn Strategy', lowBurn],
  ['Partnerships Only', partnershipsOnly],
  ['Pivot Spam', pivotSpam],
  ['Team Building', teamBuilding],
  ['Optimal Play', optimalPlay],
]

for (const [name, strategy] of strategies) {
  const result = runSimulation(name, strategy)
  const final = result.history[result.history.length - 1]

  console.log(`--- ${name} ---`)
  console.log(`  Result: ${result.result.toUpperCase()} (${result.reason})`)
  console.log(`  Months: ${result.months}`)
  console.log(`  Final: funds=$${final.funds.toLocaleString()} | users=${final.users} | product=${final.product}% | heat=${final.heat}% | competition=${final.competition}% | morale=${final.morale}% | burn=${final.burnRate}`)
  console.log()
}

// === DETAILED MONTHLY LOG FOR SUSPICIOUS STRATEGIES ===
console.log('\n=== DETAILED LOGS ===\n')

const detailedStrategies = [
  ['Pure Cost Optimization Spam', costOptSpam],
  ['Pivot Spam', pivotSpam],
  ['Pure Fundraising (exploit test)', pureFundraise],
]

for (const [name, strategy] of detailedStrategies) {
  const result = runSimulation(name, strategy)
  console.log(`--- ${name} ---`)
  for (const h of result.history) {
    console.log(`  M${h.month}: funds=$${h.funds.toLocaleString().padStart(7)} | users=${String(h.users).padStart(4)} | product=${String(h.product).padStart(3)}% | heat=${String(h.heat).padStart(3)}% | comp=${String(h.competition).padStart(3)}% | morale=${String(h.morale).padStart(3)}% | burn=${String(h.burnRate).padStart(3)} | burnCost=$${h.burnCost.toLocaleString()}`)
  }
  console.log()
}