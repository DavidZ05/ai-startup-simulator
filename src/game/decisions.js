export const INDUSTRIES = [
  { id: 'ai-saas', name: 'AI SaaS', emoji: '🤖', description: 'AI-powered software solutions' },
  { id: 'fintech', name: 'FinTech', emoji: '💰', description: 'Financial technology' },
  { id: 'healthtech', name: 'HealthTech', emoji: '🏥', description: 'Healthcare technology' },
  { id: 'edtech', name: 'EdTech', emoji: '📚', description: 'Education technology' },
  { id: 'ecommerce', name: 'E-Commerce', emoji: '🛒', description: 'Online marketplace' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Game development' },
  { id: 'cleantech', name: 'CleanTech', emoji: '🌱', description: 'Clean technology' },
  { id: 'biotech', name: 'BioTech', emoji: '🧬', description: 'Biotechnology' },
]

export const DECISIONS = [
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
    cost: (funds) => Math.round(funds * 0.05 + 10000),
    effects: { competition: +12, marketHeat: +5 },
    category: 'finance',
    require: { product: 30, users: 20 },
    cooldown: 3,
    dynamicEffect: (state) => {
      const base = 80000
      const productBonus = state.product * 1500
      const userBonus = state.users * 500
      const heatBonus = state.marketHeat * 800
      const roundPenalty = Math.max(0, (state.fundraisingCount || 0)) * 30000
      const amount = Math.round(base + productBonus + userBonus + heatBonus - roundPenalty)
      return { funds: Math.max(20000, amount) }
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

export const EVENTS = [
  {
    id: 'viral-moment',
    title: 'Viral Moment! 🎉',
    description: 'Your product went viral on social media!',
    effects: { users: +50, marketHeat: +20, funds: +10000 },
    probability: 0.08,
  },
  {
    id: 'talent-poach',
    title: 'Talent Poached 😟',
    description: 'A competitor offered double salary to your best engineer.',
    effects: { teamMorale: -15, product: -5 },
    probability: 0.06,
  },
  {
    id: 'investor-meeting',
    title: 'Investor Interest 📈',
    description: 'A top VC firm wants to schedule a meeting.',
    effects: { marketHeat: +10, funds: +5000 },
    probability: 0.07,
  },
  {
    id: 'server-crash',
    title: 'Server Crash 💥',
    description: 'Unexpected downtime damaged user trust.',
    effects: { users: -20, teamMorale: -10, marketHeat: -5 },
    probability: 0.05,
  },
  {
    id: 'press-coverage',
    title: 'Press Coverage 📰',
    description: 'TechCrunch featured your startup in an article!',
    effects: { users: +30, marketHeat: +15 },
    probability: 0.06,
  },
  {
    id: 'regulatory',
    title: 'Regulatory Challenge ⚖️',
    description: 'New regulations may affect your business model.',
    effects: { product: -10, burnRate: +5, competition: +5 },
    probability: 0.04,
  },
  {
    id: 'new-competitor',
    title: 'New Competitor 🆕',
    description: 'A well-funded startup entered your market.',
    effects: { competition: +15, marketHeat: +5 },
    probability: 0.07,
  },
  {
    id: 'team-offsite',
    title: 'Team Offsite 🏕️',
    description: 'A team building event boosted morale!',
    effects: { teamMorale: +20 },
    probability: 0.05,
  },
  {
    id: 'customer-churn',
    title: 'Customer Churn 😔',
    description: 'Some early users cancelled their subscriptions.',
    effects: { users: -15, revenue: -5, marketHeat: -5 },
    probability: 0.06,
  },
  {
    id: 'breakthrough',
    title: 'Technical Breakthrough! 🧪',
    description: 'Your team made a major technical discovery!',
    effects: { product: +20, marketHeat: +10, teamMorale: +10 },
    probability: 0.04,
  },
]

export function getEndCondition(company) {
  if (company.funds <= 0) return { type: 'fail', reason: 'Out of funds! Your startup ran out of money.' }
  if (company.teamMorale <= 10) return { type: 'fail', reason: 'Team morale collapsed. Everyone quit!' }
  if (company.month > 36) return { type: 'fail', reason: 'Time\'s up! Your startup failed to achieve product-market fit within 3 years.' }

  if (company.product >= 80 && company.users >= 100 && company.marketHeat >= 60) {
    return { type: 'success', reason: '🎉 You achieved product-market fit! Your startup is thriving!' }
  }
  if (company.revenue >= 50 && company.users >= 150 && company.marketHeat >= 70) {
    return { type: 'success', reason: '🏆 Unicorn status! Your startup is valued at over $1B!' }
  }
  if (company.funds >= 500000 && company.product >= 70 && company.users >= 80) {
    return { type: 'success', reason: '🌟 Series A complete! Your startup is set for growth!' }
  }
  if (company.month >= 24 && company.product >= 60 && company.users >= 50 && company.funds > 100000) {
    return { type: 'success', reason: '✅ Profitable and growing! Your startup is sustainable!' }
  }

  return null
}

export const INITIAL_COMPANY = {
  name: '',
  industry: '',
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
  decisionsUsed: 0,
}