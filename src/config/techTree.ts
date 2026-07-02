export interface TechNode {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
  requires: string[]
  effects: {
    product?: number
    users?: number
    revenue?: number
    marketHeat?: number
    burnRate?: number
  }
  category: 'core' | 'growth' | 'efficiency'
}

export const TECH_TREE: TechNode[] = [
  {
    id: 'mvp',
    name: 'MVP Launch',
    emoji: '🚀',
    description: 'Ship your minimum viable product',
    cost: 0,
    requires: [],
    effects: { product: +10 },
    category: 'core',
  },
  {
    id: 'ui-design',
    name: 'UI/UX Overhaul',
    emoji: '🎨',
    description: 'Professional design system',
    cost: 15000,
    requires: ['mvp'],
    effects: { product: +10, users: +10, marketHeat: +5 },
    category: 'core',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    emoji: '📱',
    description: 'Native mobile experience',
    cost: 30000,
    requires: ['ui-design'],
    effects: { users: +25, marketHeat: +10 },
    category: 'growth',
  },
  {
    id: 'api-platform',
    name: 'API Platform',
    emoji: '🔌',
    description: 'Open API for third-party integrations',
    cost: 25000,
    requires: ['mvp'],
    effects: { users: +15, revenue: +10, marketHeat: +8 },
    category: 'growth',
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    emoji: '🤖',
    description: 'Machine learning powered capabilities',
    cost: 40000,
    requires: ['api-platform'],
    effects: { product: +15, marketHeat: +12, burnRate: +3 },
    category: 'core',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    emoji: '📊',
    description: 'Data-driven insights dashboard',
    cost: 20000,
    requires: ['mvp'],
    effects: { product: +8, revenue: +8 },
    category: 'efficiency',
  },
  {
    id: 'automation',
    name: 'Process Automation',
    emoji: '⚙️',
    description: 'Automate repetitive tasks',
    cost: 18000,
    requires: ['analytics'],
    effects: { burnRate: -3, product: +5 },
    category: 'efficiency',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Features',
    emoji: '🏢',
    description: 'SSO, audit logs, compliance',
    cost: 35000,
    requires: ['ui-design', 'analytics'],
    effects: { revenue: +15, users: +20 },
    category: 'growth',
  },
  {
    id: 'global',
    name: 'Global Expansion',
    emoji: '🌍',
    description: 'Multi-language, multi-region support',
    cost: 45000,
    requires: ['mobile-app', 'enterprise'],
    effects: { users: +40, marketHeat: +15, burnRate: +2 },
    category: 'growth',
  },
  {
    id: 'platform',
    name: 'Platform Ecosystem',
    emoji: '🌐',
    description: 'Marketplace for third-party extensions',
    cost: 50000,
    requires: ['api-platform', 'enterprise'],
    effects: { users: +30, revenue: +20, marketHeat: +10 },
    category: 'growth',
  },
]

export function getAvailableTech(unlockedIds: string[]): TechNode[] {
  return TECH_TREE.filter(
    t => !unlockedIds.includes(t.id) &&
    t.requires.every(r => unlockedIds.includes(r))
  )
}