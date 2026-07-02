import type { Company, Decision, MonthResult, MonthlyReport, GameEvent, QuarterlyReport } from '../types/game'
import { GAME_CONFIG } from '../config/constants'
import { EVENTS } from '../config/decisions'
import { NEWS_ITEMS, triggerNews, type NewsItem } from '../config/news'
import { generateCompetitor, competitorAction, type Competitor } from '../config/competitors'
import { checkAchievements } from '../config/achievements'
import { applyEffects, getDecisionCost } from './calculator'
import { checkCooldown, checkRequirements } from './validator'
import { triggerRandomEvents } from './events'
import { getEndCondition } from './conditions'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function generateQuarterlyReport(
  company: Company,
  fullHistory: Company[]
): QuarterlyReport | null {
  if (company.month % 3 !== 0) return null

  const quarterMonths = fullHistory.slice(-3)
  if (quarterMonths.length < 3) return null
  const startMonth = quarterMonths[0]
  const endMonth = company

  const fundChange = endMonth.funds - startMonth.funds
  const userChange = endMonth.users - startMonth.users
  const productChange = endMonth.product - startMonth.product
  const moraleChange = endMonth.teamMorale - startMonth.teamMorale

  const highlights: string[] = []
  if (fundChange > 50000) highlights.push(`Strong financial growth: +$${fundChange.toLocaleString()}`)
  if (fundChange < -50000) highlights.push(`Financial decline: -$${Math.abs(fundChange).toLocaleString()}`)
  if (userChange > 50) highlights.push(`Excellent user growth: +${userChange} users`)
  if (userChange < -20) highlights.push(`User churn: ${userChange} users lost`)
  if (productChange > 20) highlights.push(`Product breakthrough: +${productChange}% completion`)
  if (moraleChange > 15) highlights.push(`Team morale soaring!`)
  if (moraleChange < -15) highlights.push(`Warning: Team morale declining`)

  if (highlights.length === 0) {
    highlights.push('Steady progress across all metrics')
  }

  const quarter = Math.ceil(company.month / 3)
  const year = Math.floor((company.month - 1) / 12) + 1

  return {
    month: company.month,
    summary: `Q${quarter} Year ${year}: ${fundChange >= 0 ? 'Growth' : 'Challenge'} quarter with ${userChange >= 0 ? '+' : ''}${userChange} users and ${fundChange >= 0 ? '+' : ''}$${fundChange.toLocaleString()} funds change.`,
    highlights,
    achievements: company.unlockedAchievements?.slice(-3) || [],
  }
}

function generateReport(
  before: Company,
  after: Company,
  decisions: Decision[],
  events: GameEvent[],
  news: NewsItem | null,
  competitor: Competitor | null,
  newAchievements: string[]
): MonthlyReport {
  const decisionSummary = decisions.map(d => `• ${d.emoji} ${d.name}`).join('\n')
  const eventSummary = events.map(e => `${e.title}: ${e.description}`).join('\n')
  const newsSummary = news ? `📰 ${news.title}: ${news.content}` : ''
  const competitorSummary = competitor
    ? `⚔️ New competitor: ${competitor.name} (${competitor.strategy})`
    : ''

  const fundingStatus = after.funds > 200000 ? 'Strong' :
    after.funds > 100000 ? 'Moderate' :
    after.funds > 50000 ? 'Low' : 'Critical'

  const moraleStatus = after.teamMorale > 70 ? 'Excellent' :
    after.teamMorale > 50 ? 'Good' :
    after.teamMorale > 30 ? 'Concerning' : 'Critical'

  const productStatus = after.product > 70 ? 'Advanced' :
    after.product > 40 ? 'Progressing' : 'Early Stage'

  const highlights: string[] = []
  if (after.users > before.users + 20) highlights.push(`Strong user growth: +${after.users - before.users} users`)
  if (after.marketHeat > before.marketHeat + 10) highlights.push('Market awareness surging!')
  if (after.teamMorale < before.teamMorale - 10) highlights.push('Warning: Team morale dropping')
  if (after.funds < 50000) highlights.push('⚠️ Cash runway critical!')
  if (after.product > 60) highlights.push('Product is maturing nicely')
  if (news && news.category === 'positive') highlights.push(`Good news: ${news.title}`)
  if (competitor) highlights.push(`New rival: ${competitor.name}`)

  const insights: string[] = [
    after.burnRate > 30 ? 'High burn rate is unsustainable. Consider cost optimization.' : '',
    after.competition > 60 ? 'Competition is fierce. Differentiation is key.' : '',
    after.marketHeat < 20 ? 'Market visibility is low. Consider marketing or partnerships.' : '',
    after.product < 30 ? 'Product needs significant work before scaling.' : '',
    after.funds > 300000 && after.product > 50 ? 'Good position to scale aggressively!' : '',
    after.users > 50 && after.revenue > 20 ? 'Strong unit economics emerging.' : '',
  ].filter(Boolean)

  return {
    period: `Month ${after.month - 1}`,
    decisionSummary,
    eventSummary: eventSummary || 'No major events this month.',
    newsSummary,
    competitorSummary,
    fundingStatus,
    moraleStatus,
    productStatus,
    highlights: highlights.length ? highlights.join('\n') : 'Steady progress across the board.',
    insight: insights.length ? insights[0]! : 'Keep pushing forward with balanced decisions.',
    burnCost: Math.round(after.burnRate * GAME_CONFIG.BURN_COST_MULTIPLIER),
    revenue: after.revenue,
    userGrowth: after.users - before.users,
    newAchievements,
  }
}

export function processMonth(state: Company, decisions: Decision[], history: Company[] = []): MonthResult {
  let newState = { ...state }

  for (const decision of decisions) {
    const cost = getDecisionCost(decision, newState.funds)

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

  const burnCost = Math.round(newState.burnRate * GAME_CONFIG.BURN_COST_MULTIPLIER)
  newState.funds = Math.max(0, newState.funds - burnCost)

  const revenueGrowth = newState.revenue > 0 ? Math.max(1, Math.round(newState.users * GAME_CONFIG.REVENUE_GROWTH_RATE)) : 0
  newState.revenue = Math.min(100, newState.revenue + revenueGrowth)

  const userGrowth = Math.round(newState.marketHeat * GAME_CONFIG.USER_GROWTH_RATE)
  newState.users = Math.min(1000, newState.users + userGrowth)

  if (newState.burnRate > GAME_CONFIG.MORALE_DECAY_THRESHOLD) {
    newState.teamMorale = Math.max(0, newState.teamMorale - GAME_CONFIG.MORALE_DECAY_AMOUNT)
  }

  if (newState.competition > GAME_CONFIG.COMPETITION_DECAY_THRESHOLD) {
    newState.marketHeat = Math.max(0, newState.marketHeat - GAME_CONFIG.COMPETITION_DECAY_AMOUNT)
  }

  const events = triggerRandomEvents(EVENTS)
  for (const event of events) {
    newState = applyEffects(newState, event.effects)
  }

  const news = triggerNews()
  if (news) {
    newState = applyEffects(newState, news.effects)
  }

  const newCompetitor = generateCompetitor(newState.month)
  if (newCompetitor) {
    newState.competitors = [...(newState.competitors || []), newCompetitor]
  }

  let competitorEffects = { heatChange: 0, competitionChange: 0 }
  for (const comp of newState.competitors || []) {
    const effects = competitorAction(comp, newState.marketHeat)
    competitorEffects.heatChange += effects.heatChange
    competitorEffects.competitionChange += effects.competitionChange
  }
  newState.marketHeat = Math.max(0, Math.min(100, newState.marketHeat + competitorEffects.heatChange))
  newState.competition = Math.max(0, Math.min(100, newState.competition + competitorEffects.competitionChange))

  const newAchievements = checkAchievements(newState, [...history, newState], newState.unlockedAchievements || [])
  newState.unlockedAchievements = [...(newState.unlockedAchievements || []), ...newAchievements.map(a => a.id)]

  const quarterlyReport = generateQuarterlyReport(newState, [...history, newState])
  newState.lastQuarterReport = quarterlyReport

  newState.month += 1

  const endCondition = getEndCondition(newState)

  const monthName = MONTH_NAMES[(newState.month - 2) % 12]
  const year = Math.floor((newState.month - 2) / 12) + 1

  return {
    state: newState,
    events,
    report: generateReport(state, newState, decisions, events, news, newCompetitor, newAchievements.map(a => `${a.emoji} ${a.name}`)),
    endCondition,
    period: `${monthName}, Year ${year}`,
  }
}