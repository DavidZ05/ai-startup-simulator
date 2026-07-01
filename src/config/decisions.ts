import type { Industry, Decision, GameEvent, Company } from '../types/game'
import { FUNDRAISING_CONFIG } from './constants'

export const INDUSTRIES: Industry[] = [
  { id: 'ai-saas', name: 'AI SaaS', emoji: '🤖', description: 'AI-powered software solutions' },
  { id: 'fintech', name: 'FinTech', emoji: '💰', description: 'Financial technology' },
  { id: 'healthtech', name: 'HealthTech', emoji: '🏥', description: 'Healthcare technology' },
  { id: 'edtech', name: 'EdTech', emoji: '📚', description: 'Education technology' },
  { id: 'ecommerce', name: 'E-Commerce', emoji: '🛒', description: 'Online marketplace' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Game development' },
  { id: 'cleantech', name: 'CleanTech', emoji: '🌱', description: 'Clean technology' },
  { id: 'biotech', name: 'BioTech', emoji: '🧬', description: 'Biotechnology' },
]

export const DECISIONS: Decision[] = [
  {
    id: 'product-dev',
    name: 'Product Development',
    emoji: '💻',
    description: 'Invest in building new features and improving your product.',
    cost: (funds) => Math.round(funds * 0.12),
    effects: { product: +15, revenue: +5, teamMorale: +3, burnRate: +1 },
    category: 'core',
  },
  {
    id: 'marketing',
    name: 'Marketing Push',
    emoji: '📢',
    description: 'Run marketing campaigns to acquire new users.',
    cost: (funds) => Math.round(funds * 0.18),
    effects: { users: +30, marketHeat: +10, burnRate: +2, revenue: +8 },
    category: 'growth',
  },
  {
    id: 'hiring',
    name: 'Talent Recruitment',
    emoji: '👥',
    description: 'Hire talented engineers and designers.',
    cost: (funds) => Math.round(funds * 0.1),
    effects: { teamMorale: +8, product: +5, burnRate: +3 },
    category: 'team',
  },
  {
    id: 'fundraising',
    name: 'Fundraising',
    emoji: '🚀',
    description: 'Pitch to investors. Success depends on your traction.',
    cost: (funds) => Math.round(funds * FUNDRAISING_CONFIG.COST_PERCENT + FUNDRAISING_CONFIG.COST_BASE),
    effects: { competition: FUNDRAISING_CONFIG.COMPETITION_PENALTY, marketHeat: +5 },
    category: 'finance',
    require: { product: FUNDRAISING_CONFIG.REQUIRE_PRODUCT, users: FUNDRAISING_CONFIG.REQUIRE_USERS },
    cooldown: FUNDRAISING_CONFIG.COOLDOWN_MONTHS,
    dynamicEffect: (state: Company) => {
      const base = FUNDRAISING_CONFIG.BASE_AMOUNT
      const productBonus = state.product * FUNDRAISING_CONFIG.PRODUCT_MULTIPLIER
      const userBonus = state.users * FUNDRAISING_CONFIG.USER_MULTIPLIER
      const heatBonus = state.marketHeat * FUNDRAISING_CONFIG.HEAT_MULTIPLIER
      const roundPenalty = (state.fundraisingCount || 0) * FUNDRAISING_CONFIG.ROUND_PENALTY
      const amount = Math.round(base + productBonus + userBonus + heatBonus - roundPenalty)
      return { funds: Math.max(FUNDRAISING_CONFIG.MINIMUM_AMOUNT, amount) }
    },
  },
  {
    id: 'cost-cut',
    name: 'Cost Optimization',
    emoji: '✂️',
    description: 'Cut unnecessary expenses to extend runway.',
    cost: () => 2000,
    effects: { burnRate: -5, teamMorale: -8 },
    category: 'finance',
  },
  {
    id: 'user-research',
    name: 'User Research',
    emoji: '🔍',
    description: 'Conduct user interviews and market research.',
    cost: (funds) => Math.round(funds * 0.08),
    effects: { product: +10, marketHeat: +5, users: +10 },
    category: 'core',
  },
  {
    id: 'partnerships',
    name: 'Strategic Partnerships',
    emoji: '🤝',
    description: 'Form alliances with other companies.',
    cost: (funds) => Math.round(funds * 0.1),
    effects: { users: +20, marketHeat: +8, revenue: +10, competition: -5 },
    category: 'growth',
  },
  {
    id: 'pivot',
    name: 'Strategic Pivot',
    emoji: '🔄',
    description: 'Refocus your product direction based on market feedback.',
    cost: (funds) => Math.round(funds * 0.18),
    effects: { product: +10, marketHeat: +15, revenue: +12, teamMorale: -5 },
    category: 'core',
  },
]

export const EVENTS: GameEvent[] = [
  { id: 'viral-moment', title: 'Viral Moment! 🎉', description: 'Your product went viral on social media!', effects: { users: +50, marketHeat: +20, funds: +10000 }, probability: 0.08 },
  { id: 'talent-poach', title: 'Talent Poached 😟', description: 'A competitor offered double salary to your best engineer.', effects: { teamMorale: -15, product: -5 }, probability: 0.06 },
  { id: 'investor-meeting', title: 'Investor Interest 📈', description: 'A top VC firm wants to schedule a meeting.', effects: { marketHeat: +10, funds: +5000 }, probability: 0.07 },
  { id: 'server-crash', title: 'Server Crash 💥', description: 'Unexpected downtime damaged user trust.', effects: { users: -20, teamMorale: -10, marketHeat: -5 }, probability: 0.05 },
  { id: 'press-coverage', title: 'Press Coverage 📰', description: 'TechCrunch featured your startup in an article!', effects: { users: +30, marketHeat: +15 }, probability: 0.06 },
  { id: 'regulatory', title: 'Regulatory Challenge ⚖️', description: 'New regulations may affect your business model.', effects: { product: -10, burnRate: +5, competition: +5 }, probability: 0.04 },
  { id: 'new-competitor', title: 'New Competitor 🆕', description: 'A well-funded startup entered your market.', effects: { competition: +15, marketHeat: +5 }, probability: 0.07 },
  { id: 'team-offsite', title: 'Team Offsite 🏕️', description: 'A team building event boosted morale!', effects: { teamMorale: +20 }, probability: 0.05 },
  { id: 'customer-churn', title: 'Customer Churn 😔', description: 'Some early users cancelled their subscriptions.', effects: { users: -15, revenue: -5, marketHeat: -5 }, probability: 0.06 },
  { id: 'breakthrough', title: 'Technical Breakthrough! 🧪', description: 'Your team made a major technical discovery!', effects: { product: +20, marketHeat: +10, teamMorale: +10 }, probability: 0.04 },
]