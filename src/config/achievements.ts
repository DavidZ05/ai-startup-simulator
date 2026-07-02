import type { Company } from '../types/game'

export interface Achievement {
  id: string
  name: string
  emoji: string
  description: string
  condition: (company: Company, history: Company[]) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    name: 'First Step',
    emoji: '👶',
    description: 'Start your first company',
    condition: () => true,
  },
  {
    id: 'fundraiser',
    name: 'Fundraiser',
    emoji: '💰',
    description: 'Complete your first fundraising round',
    condition: (c) => c.fundraisingCount >= 1,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    emoji: '👥',
    description: 'Reach 100 users',
    condition: (c) => c.users >= 100,
  },
  {
    id: 'half-way',
    name: 'Half Way There',
    emoji: '🎯',
    description: 'Reach 50% product completion',
    condition: (c) => c.product >= 50,
  },
  {
    id: 'product-master',
    name: 'Product Master',
    emoji: '💻',
    description: 'Reach 80% product completion',
    condition: (c) => c.product >= 80,
  },
  {
    id: 'hot-stuff',
    name: 'Hot Stuff',
    emoji: '🔥',
    description: 'Reach 50% market heat',
    condition: (c) => c.marketHeat >= 50,
  },
  {
    id: 'viral',
    name: 'Viral Sensation',
    emoji: '📱',
    description: 'Reach 80% market heat',
    condition: (c) => c.marketHeat >= 80,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    emoji: '🛡️',
    description: 'Survive for 12 months',
    condition: (c) => c.month >= 12,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    emoji: '🏅',
    description: 'Survive for 24 months',
    condition: (c) => c.month >= 24,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    emoji: '💎',
    description: 'Accumulate $500K in funds',
    condition: (c) => c.funds >= 500000,
  },
  {
    id: 'efficiency',
    name: 'Lean Machine',
    emoji: '⚡',
    description: 'Keep burn rate below 5 for 6 months',
    condition: (c, h) => {
      if (h.length < 6) return false
      return h.slice(-6).every(s => s.burnRate <= 5)
    },
  },
  {
    id: 'people-person',
    name: 'People Person',
    emoji: '❤️',
    description: 'Keep morale above 80 for 6 months',
    condition: (c, h) => {
      if (h.length < 6) return false
      return h.slice(-6).every(s => s.teamMorale >= 80)
    },
  },
  {
    id: 'underdog',
    name: 'Underdog',
    emoji: '🐕',
    description: 'Win with less than $50K starting funds in final month',
    condition: (c) => c.month > 24 && c.funds < 50000 && c.product >= 60,
  },
  {
    id: 'speedrun',
    name: 'Speedrun',
    emoji: '⏱️',
    description: 'Win in under 12 months',
    condition: (c) => c.month <= 12 && c.product >= 80 && c.users >= 100,
  },
]

export function checkAchievements(
  company: Company,
  history: Company[],
  unlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    a => !unlockedIds.includes(a.id) && a.condition(company, history)
  )
}