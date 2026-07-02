import type { DecisionEffect } from '../types/game'

export interface EmployeeRole {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
  effects: DecisionEffect
  category: 'team'
  require?: Record<string, number>
}

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  {
    id: 'junior-dev',
    name: 'Junior Developer',
    emoji: '👶',
    description: 'Entry-level engineer. Low cost, modest contribution.',
    cost: 8000,
    effects: { product: +5, burnRate: +1 },
    category: 'team',
  },
  {
    id: 'senior-dev',
    name: 'Senior Developer',
    emoji: '👨‍💻',
    description: 'Experienced engineer. Faster product development.',
    cost: 15000,
    effects: { product: +10, teamMorale: +3, burnRate: +2 },
    category: 'team',
    require: { product: 30 },
  },
  {
    id: 'lead-eng',
    name: 'Engineering Lead',
    emoji: '👩‍💻',
    description: 'Technical leader. Major product boost, improves team.',
    cost: 25000,
    effects: { product: +15, teamMorale: +8, burnRate: +3 },
    category: 'team',
    require: { product: 50, users: 30 },
  },
  {
    id: 'product-mgr',
    name: 'Product Manager',
    emoji: '📋',
    description: 'Strategic product thinking. Balanced improvements.',
    cost: 18000,
    effects: { product: +8, marketHeat: +5, users: +10 },
    category: 'team',
    require: { product: 25 },
  },
  {
    id: 'designer',
    name: 'UI/UX Designer',
    emoji: '🎨',
    description: 'Beautiful interfaces. Users love your product.',
    cost: 12000,
    effects: { product: +6, users: +15, marketHeat: +8 },
    category: 'team',
  },
  {
    id: 'marketer',
    name: 'Marketing Specialist',
    emoji: '📢',
    description: 'Growth hacker. Drives user acquisition.',
    cost: 14000,
    effects: { users: +25, marketHeat: +12, revenue: +5 },
    category: 'team',
    require: { users: 20 },
  },
  {
    id: 'sales',
    name: 'Sales Representative',
    emoji: '💼',
    description: 'Closes deals. Direct revenue impact.',
    cost: 16000,
    effects: { revenue: +12, users: +10, funds: +5000 },
    category: 'team',
    require: { product: 40, users: 25 },
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    emoji: '⚙️',
    description: 'Infrastructure expert. Reduces burn, improves reliability.',
    cost: 20000,
    effects: { burnRate: -3, product: +5, teamMorale: +5 },
    category: 'team',
    require: { product: 35 },
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    emoji: '📊',
    description: 'Analytics wizard. Data-driven decisions.',
    cost: 22000,
    effects: { product: +8, revenue: +8, marketHeat: +5 },
    category: 'team',
    require: { product: 45, users: 40 },
  },
  {
    id: 'cto',
    name: 'CTO (Chief Tech Officer)',
    emoji: '🧑‍💼',
    description: 'Technical visionary. Massive product and morale boost.',
    cost: 40000,
    effects: { product: +20, teamMorale: +15, burnRate: +4 },
    category: 'team',
    require: { product: 60, users: 50, funds: 100000 },
  },
]

export function getAvailableEmployees(currentEmployees: string[]): EmployeeRole[] {
  return EMPLOYEE_ROLES.filter(e => !currentEmployees.includes(e.id))
}
