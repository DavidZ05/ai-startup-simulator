import type { DecisionEffect } from '../types/game'

export interface NewsItem {
  id: string
  title: string
  content: string
  effects: DecisionEffect
  probability: number
  category: 'positive' | 'negative' | 'neutral'
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'ai-boom',
    title: 'AI Investment Surge',
    content: 'Venture capital flooding into AI startups this quarter.',
    effects: { marketHeat: +8, competition: +5 },
    probability: 0.08,
    category: 'positive',
  },
  {
    id: 'recession',
    title: 'Economic Slowdown',
    content: 'Tech spending expected to decrease amid uncertainty.',
    effects: { marketHeat: -5, users: -10 },
    probability: 0.06,
    category: 'negative',
  },
  {
    id: 'regulation',
    title: 'New Tech Regulations',
    content: 'Government announces new data privacy requirements.',
    effects: { product: -5, burnRate: +2 },
    probability: 0.05,
    category: 'negative',
  },
  {
    id: 'talent-war',
    title: 'Tech Talent Shortage',
    content: 'Engineering salaries skyrocketing across the industry.',
    effects: { burnRate: +3, teamMorale: -5 },
    probability: 0.07,
    category: 'negative',
  },
  {
    id: 'partnership-trend',
    title: 'Partnership Season',
    content: 'Big companies seeking startup partnerships for innovation.',
    effects: { users: +15, marketHeat: +5 },
    probability: 0.06,
    category: 'positive',
  },
  {
    id: 'open-source',
    title: 'Open Source Movement',
    content: 'Community-driven alternatives gaining traction.',
    effects: { competition: +8 },
    probability: 0.05,
    category: 'neutral',
  },
  {
    id: 'funding-round',
    title: 'Record Funding Quarter',
    content: 'Multiple unicorns诞生, investors bullish on tech.',
    effects: { marketHeat: +10, competition: +8 },
    probability: 0.04,
    category: 'neutral',
  },
  {
    id: 'layoffs',
    title: 'Industry Layoffs',
    content: 'Major tech companies announce workforce reductions.',
    effects: { teamMorale: -8, competition: -5 },
    probability: 0.06,
    category: 'negative',
  },
  {
    id: 'innovation-award',
    title: 'Innovation Award',
    content: 'Your category recognized as most innovative sector.',
    effects: { marketHeat: +12, product: +5 },
    probability: 0.03,
    category: 'positive',
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain Issues',
    content: 'Cloud infrastructure costs increasing temporarily.',
    effects: { burnRate: +4 },
    probability: 0.05,
    category: 'negative',
  },
]

export function triggerNews(): NewsItem | null {
  for (const news of NEWS_ITEMS) {
    if (Math.random() < news.probability) {
      return news
    }
  }
  return null
}