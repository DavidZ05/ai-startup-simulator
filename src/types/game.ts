export interface Company {
  name: string
  industry: string
  targetUsers: string
  funds: number
  users: number
  revenue: number
  teamMorale: number
  product: number
  marketHeat: number
  competition: number
  burnRate: number
  month: number
  maxDecisions: number
  fundraisingCount: number
  cooldowns: Record<string, number>
  unlockedAchievements?: string[]
  unlockedTech?: string[]
  unlockedMarkets?: string[]
  employees?: string[]
  competitors?: CompetitorState[]
  lastQuarterReport?: QuarterlyReport | null
  ipoReady?: boolean
  acquisitionOffers?: AcquisitionOffer[]
}

export interface CompetitorState {
  id: string
  name: string
  strength: number
  strategy: 'aggressive' | 'balanced' | 'conservative'
}

export interface AcquisitionOffer {
  id: string
  company: string
  amount: number
  terms: string
  month: number
}

export interface QuarterlyReport {
  month: number
  summary: string
  highlights: string[]
  achievements: string[]
}

export interface DecisionEffect {
  funds?: number
  users?: number
  revenue?: number
  teamMorale?: number
  product?: number
  marketHeat?: number
  competition?: number
  burnRate?: number
}

export interface Decision {
  id: string
  name: string
  emoji: string
  description: string
  cost: number | ((funds: number) => number)
  effects: DecisionEffect
  category: 'core' | 'growth' | 'team' | 'finance'
  require?: Partial<Record<keyof Company, number>>
  cooldown?: number
  dynamicEffect?: (state: Company) => DecisionEffect
}

export interface GameEvent {
  id: string
  title: string
  description: string
  effects: DecisionEffect
  probability: number
}

export interface EndCondition {
  type: 'success' | 'fail'
  reason: string
}

export interface Industry {
  id: string
  name: string
  emoji: string
  description: string
}

export interface MonthlyReport {
  period: string
  decisionSummary: string
  eventSummary: string
  newsSummary: string
  competitorSummary: string
  fundingStatus: string
  moraleStatus: string
  productStatus: string
  highlights: string
  insight: string
  burnCost: number
  revenue: number
  userGrowth: number
  newAchievements: string[]
}

export interface MonthResult {
  state: Company
  events: GameEvent[]
  report: MonthlyReport
  endCondition: EndCondition | null
  period: string
}

export type GamePhase = 'create' | 'game' | 'end'