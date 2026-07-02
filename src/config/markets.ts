import type { DecisionEffect } from '../types/game'

export interface Market {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
  effects: DecisionEffect
  unlockRequirement?: {
    users?: number
    product?: number
    funds?: number
  }
}

export const MARKETS: Market[] = [
  {
    id: 'local',
    name: 'Local Market',
    emoji: '🏠',
    description: 'Your home market. Low cost, stable growth.',
    cost: 0,
    effects: { users: 10, marketHeat: 5 },
  },
  {
    id: 'us',
    name: 'United States',
    emoji: '🇺🇸',
    description: 'The world\'s largest tech market. High potential, high competition.',
    cost: 50000,
    effects: { users: 30, marketHeat: 15, competition: 10 },
    unlockRequirement: { users: 50, product: 40 },
  },
  {
    id: 'europe',
    name: 'European Union',
    emoji: '🇪🇺',
    description: 'Strict regulations but wealthy users. Moderate growth.',
    cost: 40000,
    effects: { users: 25, marketHeat: 10, competition: 5 },
    unlockRequirement: { users: 30, product: 30 },
  },
  {
    id: 'asia',
    name: 'Asia Pacific',
    emoji: '🌏',
    description: 'Fast-growing markets with massive user potential.',
    cost: 35000,
    effects: { users: 40, marketHeat: 8, competition: 8 },
    unlockRequirement: { users: 20, product: 25 },
  },
  {
    id: 'india',
    name: 'India',
    emoji: '🇮🇳',
    description: 'Massive population, price-sensitive users. High volume, low ARPU.',
    cost: 25000,
    effects: { users: 50, marketHeat: 5, revenue: -5 },
    unlockRequirement: { users: 15, product: 20 },
  },
  {
    id: 'japan',
    name: 'Japan',
    emoji: '🇯🇵',
    description: 'Premium market with high willingness to pay.',
    cost: 45000,
    effects: { users: 20, marketHeat: 12, revenue: 10 },
    unlockRequirement: { users: 40, product: 50 },
  },
  {
    id: 'brazil',
    name: 'Brazil',
    emoji: '🇧🇷',
    description: 'Emerging market with growing tech adoption.',
    cost: 20000,
    effects: { users: 35, marketHeat: 6, competition: 3 },
    unlockRequirement: { users: 10, product: 15 },
  },
  {
    id: 'middleeast',
    name: 'Middle East',
    emoji: '🇦🇪',
    description: 'High spending power, tech-savvy early adopters.',
    cost: 55000,
    effects: { users: 15, marketHeat: 18, revenue: 8 },
    unlockRequirement: { users: 60, product: 60 },
  },
]

export function getAvailableMarkets(unlockedMarkets: string[]): Market[] {
  return MARKETS.filter(m => !unlockedMarkets.includes(m.id) && m.id !== 'local')
}

export function getMarketDecision(market: Market): {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
  effects: DecisionEffect
  category: 'growth'
  require?: Record<string, number>
} {
  return {
    id: `expand-${market.id}`,
    name: `Expand to ${market.name}`,
    emoji: market.emoji,
    description: market.description,
    cost: market.cost,
    effects: market.effects,
    category: 'growth',
    require: market.unlockRequirement,
  }
}
