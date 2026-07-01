export const GAME_CONFIG = {
  INITIAL_FUNDS: 200000,
  INITIAL_USERS: 10,
  INITIAL_MORALE: 70,
  INITIAL_PRODUCT: 20,
  INITIAL_HEAT: 5,
  INITIAL_COMPETITION: 10,
  INITIAL_BURN_RATE: 8,
  MAX_MONTHS: 36,
  MAX_DECISIONS_PER_ROUND: 3,
  BURN_COST_MULTIPLIER: 1500,
  REVENUE_GROWTH_RATE: 0.02,
  USER_GROWTH_RATE: 0.3,
  MORALE_DECAY_THRESHOLD: 30,
  MORALE_DECAY_AMOUNT: 3,
  COMPETITION_DECAY_THRESHOLD: 50,
  COMPETITION_DECAY_AMOUNT: 2,
} as const

export const METRIC_LIMITS = {
  users: [0, 1000] as const,
  revenue: [0, 100] as const,
  teamMorale: [0, 100] as const,
  product: [0, 100] as const,
  marketHeat: [0, 100] as const,
  competition: [0, 100] as const,
  burnRate: [1, 100] as const,
} as const

export const FUNDRAISING_CONFIG = {
  BASE_AMOUNT: 80000,
  PRODUCT_MULTIPLIER: 1500,
  USER_MULTIPLIER: 500,
  HEAT_MULTIPLIER: 800,
  ROUND_PENALTY: 30000,
  MINIMUM_AMOUNT: 20000,
  COOLDOWN_MONTHS: 3,
  REQUIRE_PRODUCT: 30,
  REQUIRE_USERS: 20,
  COST_PERCENT: 0.05,
  COST_BASE: 10000,
  COMPETITION_PENALTY: 12,
} as const

export const VICTORY_THRESHOLDS = {
  PRODUCT_MARKET_FIT: { product: 80, users: 100, heat: 60 },
  UNICORN: { revenue: 50, users: 150, heat: 70 },
  SERIES_A: { funds: 500000, product: 70, users: 80 },
  SUSTAINABLE: { month: 24, product: 60, users: 50, funds: 100000 },
} as const

export const DEFEAT_THRESHOLDS = {
  ZERO_FUNDS: 0,
  LOW_MORALE: 10,
} as const