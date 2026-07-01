import { EVENTS, getEndCondition } from './decisions.js'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function triggerRandomEvents() {
  const triggered = []
  for (const event of EVENTS) {
    if (Math.random() < event.probability) {
      triggered.push(event)
    }
  }
  return triggered
}

function applyEffects(state, effects) {
  const newState = { ...state }
  for (const [key, value] of Object.entries(effects)) {
    if (key === 'funds') {
      newState.funds = Math.max(0, newState.funds + value)
    } else if (key === 'burnRate') {
      newState.burnRate = clamp(newState.burnRate + value, 1, 100)
    } else {
      const limits = { users: [0, 1000], revenue: [0, 100], teamMorale: [0, 100], product: [0, 100], marketHeat: [0, 100], competition: [0, 100] }
      const [min, max] = limits[key] || [0, 100]
      newState[key] = clamp(newState[key] + value, min, max)
    }
  }
  return newState
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

export function processMonth(state, decisions) {
  let newState = { ...state }

  for (const decision of decisions) {
    const cost = typeof decision.cost === 'function' ? decision.cost(newState.funds) : decision.cost

    if (newState.funds < cost) continue
    if (!checkCooldown(decision, newState)) continue
    if (!checkRequirements(decision, newState)) continue

    newState.funds -= cost

    let effects = { ...decision.effects }
    if (decision.dynamicEffect) {
      const dynamic = decision.dynamicEffect(newState)
      effects = { ...effects, ...dynamic }
    }

    newState = applyEffects(newState, effects)

    if (decision.id === 'fundraising') {
      newState.fundraisingCount = (newState.fundraisingCount || 0) + 1
      if (!newState.cooldowns) newState.cooldowns = {}
      newState.cooldowns[decision.id] = newState.month
    }
  }

  const burnCost = Math.round(newState.burnRate * 1500)
  newState.funds = Math.max(0, newState.funds - burnCost)

  const revenueGrowth = newState.revenue > 0 ? Math.round(newState.users * 0.02) : 0
  newState.revenue = clamp(newState.revenue + revenueGrowth, 0, 100)

  const userGrowth = Math.round(newState.marketHeat * 0.3)
  newState.users = clamp(newState.users + userGrowth, 0, 1000)

  if (newState.burnRate > 30) {
    newState.teamMorale = clamp(newState.teamMorale - 3, 0, 100)
  }

  if (newState.competition > 50) {
    newState.marketHeat = clamp(newState.marketHeat - 2, 0, 100)
  }

  const events = triggerRandomEvents()
  for (const event of events) {
    newState = applyEffects(newState, event.effects)
  }

  newState.month += 1

  const endCondition = getEndCondition(newState)

  const monthName = MONTH_NAMES[(newState.month - 2) % 12]
  const year = Math.floor((newState.month - 2) / 12) + 1

  return {
    state: newState,
    events,
    report: generateReport(state, newState, decisions, events),
    endCondition,
    period: `${monthName}, Year ${year}`,
  }
}

function generateReport(before, after, decisions, events) {
  const decisionSummary = decisions.map(d => `• ${d.emoji} ${d.name}`).join('\n')
  const eventSummary = events.map(e => `${e.title}: ${e.description}`).join('\n')

  const fundingStatus = after.funds > 200000 ? 'Strong' :
    after.funds > 100000 ? 'Moderate' :
    after.funds > 50000 ? 'Low' : 'Critical'

  const moraleStatus = after.teamMorale > 70 ? 'Excellent' :
    after.teamMorale > 50 ? 'Good' :
    after.teamMorale > 30 ? 'Concerning' : 'Critical'

  const productStatus = after.product > 70 ? 'Advanced' :
    after.product > 40 ? 'Progressing' : 'Early Stage'

  const highlights = []
  if (after.users > before.users + 20) highlights.push(`Strong user growth: +${after.users - before.users} users`)
  if (after.marketHeat > before.marketHeat + 10) highlights.push(`Market awareness surging!`)
  if (after.teamMorale < before.teamMorale - 10) highlights.push(`Warning: Team morale dropping`)
  if (after.funds < 50000) highlights.push(`⚠️ Cash runway critical!`)
  if (after.product > 60) highlights.push(`Product is maturing nicely`)

  const insights = [
    after.burnRate > 30 && 'High burn rate is unsustainable. Consider cost optimization.',
    after.competition > 60 && 'Competition is fierce. Differentiation is key.',
    after.marketHeat < 20 && 'Market visibility is low. Consider marketing or partnerships.',
    after.product < 30 && 'Product needs significant work before scaling.',
    after.funds > 300000 && after.product > 50 && 'Good position to scale aggressively!',
    after.users > 50 && after.revenue > 20 && 'Strong unit economics emerging.',
  ].filter(Boolean)

  return {
    period: `Month ${after.month - 1}`,
    decisionSummary,
    eventSummary: eventSummary || 'No major events this month.',
    fundingStatus,
    moraleStatus,
    productStatus,
    highlights: highlights.length ? highlights.join('\n') : 'Steady progress across the board.',
    insight: insights.length ? insights[0] : 'Keep pushing forward with balanced decisions.',
    burnCost: Math.round(after.burnRate * 1500),
    revenue: after.revenue,
    userGrowth: after.users - before.users,
  }
}