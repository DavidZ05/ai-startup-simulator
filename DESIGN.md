# AI Startup Simulator — Game Design Document

## 1. Overview

AI Startup Simulator is a turn-based business simulation game. Each round represents one month of running a startup. The player makes 3 business decisions per round, and the system calculates the outcomes based on a mathematical model. The goal is to grow the company from seed stage to product-market fit or unicorn status within 36 months.

---

## 2. Game Flow

```
Create Company → [Monthly Loop] → End Game (Success or Failure)
                    ↓
              Choose 3 Decisions
                    ↓
              Process Month (calculate metrics)
                    ↓
              Random Events (optional)
                    ↓
              Monthly Report
                    ↓
              Check End Condition → continue or end
```

---

## 3. Company Creation

The player inputs:

| Field | Description |
|-------|-------------|
| **Startup Name** | Display name, 2-30 characters |
| **Industry** | One of 8 options (AI SaaS, FinTech, HealthTech, EdTech, E-Commerce, Gaming, CleanTech, BioTech) — currently cosmetic only |
| **Target Users** | Describes the target customer segment — currently cosmetic only |

Initial company stats:

| Metric | Starting Value |
|--------|---------------|
| Funds | $200,000 |
| Users | 10 (beta testers) |
| Revenue | 0% |
| Team Morale | 70% |
| Product | 20% |
| Market Heat | 5% |
| Competition | 10% |
| Burn Rate | 8 (base) |

---

## 4. The 7 Metrics

### 4.1 Funds 💰
- **Range**: 0 – $500,000
- **Increases**: Fundraising (dynamic, see §5.4), random events
- **Decreases**: Every decision costs money; monthly burn cost = burn rate × $2,000
- **Critical threshold**: Below $50,000 triggers warning in reports

### 4.2 Users 👥
- **Range**: 0 – 1,000
- **Direct changes**: Marketing (+30), Partnerships (+20), random events
- **Automatic growth**: Each month, `users += marketHeat × 0.3`
  - Heat 20 → +6 users/month
  - Heat 50 → +15 users/month
  - Heat 80 → +24 users/month
- **Key insight**: Users are passive — you cannot directly "recruit" users. You must raise market heat first.

### 4.3 Revenue 📈
- **Range**: 0 – 100%
- **Direct changes**: Marketing (+8), Partnerships (+10), Pivot (+12), random events
- **Automatic growth**: Each month, `revenue += users × 0.02` (only if users > 0)
  - 50 users → +1%/month
  - 100 users → +2%/month
- **Key insight**: Revenue follows users. No users = no revenue growth.

### 4.4 Team Morale ❤️
- **Range**: 0 – 100%
- **Increases**: Hiring (+8), Product Dev (+3), random events
- **Decreases**: Cost Optimization (-8), Pivot (-5), random events
- **Natural decay**: If burn rate > 30, morale drops by 3/month (overworked team)
- **Game over condition**: Morale ≤ 10 → everyone quits

### 4.5 Product Completion 💻
- **Range**: 0 – 100%
- **Increases**: Product Dev (+15), User Research (+10), Hiring (+5), random events
- **Decreases**: Regulatory challenges (-10), server crashes (-5)
- **No automatic change** — product only grows from deliberate investment

### 4.6 Market Heat 🔥
- **Range**: 0 – 100%
- **Direct changes**: Marketing (+10), Partnerships (+8), Pivot (+15), random events
- **Natural decay**: If competition > 50, heat drops by 2/month (competitive pressure squeezes your visibility)
- **Key role**: Heat is the engine of user growth. No heat = no users = no revenue.

### 4.7 Competition Pressure ⚔️
- **Range**: 0 – 100%
- **Increases**: Fundraising (+12), New Competitor event (+15), Regulatory (+5)
- **Decreases**: Partnerships (-5)
- **No natural decay** — once competition rises, it stays high
- **Indirect effect**: Competition > 50 → market heat decays by 2/month

---

## 5. The 8 Decisions

Each round, the player picks up to 3 decisions. Every decision has a cost and a set of stat effects.

### 5.1 Product Development 💻
| Aspect | Value |
|--------|-------|
| Cost | 12% of current funds |
| Effects | Product +15, Revenue +5, Morale +3, Burn Rate +1 |
| Strategy | Long-term investment. Best for early game when product is immature. |

**Design rationale**: Building features is expensive but foundational. The morale bonus reflects team satisfaction from shipping. The burn rate increase models ongoing engineering costs.

### 5.2 Marketing Push 📢
| Aspect | Value |
|--------|-------|
| Cost | 18% of current funds (most expensive) |
| Effects | Users +30, Market Heat +10, Burn Rate +2, Revenue +8 |
| Strategy | Short-term growth spurt. Expensive but delivers immediate user acquisition. |

**Design rationale**: Advertising is the costliest growth lever. High burn rate models ongoing ad spend. Directly boosts both users and heat — the only decision that does both.

### 5.3 Talent Recruitment 👥
| Aspect | Value |
|--------|-------|
| Cost | 10% of current funds |
| Effects | Morale +8, Product +5, Burn Rate +3 |
| Strategy | Long-term play. People are the most expensive recurring cost (highest burn rate increase). |

**Design rationale**: Hiring improves morale (team capability) and product (more hands), but the ongoing salary cost is the highest burn rate hit in the game. This mirrors real startup economics.

### 5.4 Fundraising 🚀
| Aspect | Value |
|--------|-------|
| Cost | 5% of current funds + $10,000 (scales with wealth) |
| Effects | Competition +12, Market Heat +5, **dynamic funds** |
| Requirements | Product ≥ 30, Users ≥ 20 |
| Cooldown | 3 months between rounds |
| Strategy | Conditional lifeline. Only available after proving traction. |

**Dynamic funding formula**:
```
funds = 80K + product×1.5K + users×0.5K + heat×0.8K - fundraisingCount×30K
(minimum: $20K)
```

**Design rationale**: Three-layer restriction prevents infinite fundraising exploit:
1. **Threshold gate**: Must have product ≥ 30 and users ≥ 20. Investors don't fund vaporware.
2. **Cooldown**: 3 months between rounds. VCs don't write checks every month.
3. **Diminishing returns**: Each round raises $30K less. The first round may yield $150K+, but by round 3 you're down to $60K.
4. **Cost scales**: 5% of funds + $10K base. Richer companies pay more to pitch.
5. **Competition +12**: Public funding rounds attract competitors aggressively.

**Example progression**:
- Round 1 (product 40, users 30, heat 15): ~$130K raised
- Round 2 (product 55, users 60, heat 30): ~$170K raised
- Round 3 (product 65, users 90, heat 45): ~$180K raised (but $90K penalty from prior rounds = net ~$150K)

### 5.5 Cost Optimization ✂️
| Aspect | Value |
|--------|-------|
| Cost | $2,000 fixed |
| Effects | Burn Rate -5, Morale -8 |
| Strategy | Survival tactic. Extends runway but damages team trust. |

**Design rationale**: Cutting costs reduces monthly burn (saves $10,000/month) but morale takes a heavy hit. This models the real psychological impact of layoffs and budget cuts on remaining team members.

### 5.6 User Research 🔍
| Aspect | Value |
|--------|-------|
| Cost | 8% of current funds (cheapest) |
| Effects | Product +10, Market Heat +5, Users +10 |
| Strategy | Best early-game decision. Cheap, multi-benefit, no burn rate increase. |

**Design rationale**: Research is the cheapest decision with the broadest positive effects. It improves product (understanding what to build), attracts some users (word of mouth from interviews), and builds heat (market intelligence). No burn rate increase because research is lightweight.

### 5.7 Strategic Partnerships 🤝
| Aspect | Value |
|--------|-------|
| Cost | 10% of current funds |
| Effects | Users +20, Market Heat +8, Revenue +10, Competition -5 |
| Strategy | The most well-rounded positive decision. Only way to reduce competition. |

**Design rationale**: Partnerships are the only decision that can reduce competition (by aligning with potential rivals). They provide moderate boosts across multiple metrics. The catch is that finding good partners is hard — in practice this decision is limited by game state.

### 5.8 Strategic Pivot 🔄
| Aspect | Value |
|--------|-------|
| Cost | 18% of current funds (second most expensive) |
| Effects | Product +10, Market Heat +15, Revenue +12, Morale -5 |
| Strategy | High-risk, high-reward. Biggest heat boost in the game, but hurts morale. |

**Design rationale**: Pivoting generates buzz (heat +15, the highest of any decision) and can unlock new revenue streams. But the team suffers from direction change (morale -5). This models the real chaos of startup pivots — exciting externally, exhausting internally.

---

## 6. Monthly Processing Engine

After decisions are applied, the engine runs these automatic calculations:

### 6.0 Decision Validation
Before applying any decision, the engine checks:
1. **Affordability**: Can the company pay the cost?
2. **Cooldown**: Has enough time passed since last use? (currently only Fundraising has cooldown)
3. **Requirements**: Does the company meet minimum stat thresholds? (currently only Fundraising has requirements)
4. **Dynamic effects**: Some decisions (Fundraising) calculate effects based on current state rather than fixed values.

### 6.1 Burn Cost
```
burn_cost = burn_rate × $1,500
funds -= burn_cost
```
At base burn rate 8, you lose $12,000/month. With 200K starting funds, that's ~16 months of runway.

### 6.2 Revenue Growth
```
if users > 0:
    revenue += users × 0.02
```
Revenue is proportional to user count. More users = more potential revenue.

### 6.3 User Growth
```
users += marketHeat × 0.3
```
Users are attracted by market visibility. This is the primary passive growth mechanism.

### 6.4 Morale Decay
```
if burn_rate > 30:
    morale -= 3
```
Overworked teams (high burn) lose morale over time.

### 6.5 Competition Decay on Heat
```
if competition > 50:
    heat -= 2
```
High competition suppresses your market visibility.

### 6.6 Random Events
Each month, each event has an independent probability of triggering. Multiple events can fire in one month.

---

## 7. Random Events

| Event | Probability | Effects |
|-------|------------|---------|
| Viral Moment 🎉 | 8% | Users +50, Heat +20, Funds +$10K |
| Talent Poached 😟 | 6% | Morale -15, Product -5 |
| Investor Interest 📈 | 7% | Heat +10, Funds +$5K |
| Server Crash 💥 | 5% | Users -20, Morale -10, Heat -5 |
| Press Coverage 📰 | 6% | Users +30, Heat +15 |
| Regulatory Challenge ⚖️ | 4% | Product -10, Burn Rate +5, Competition +5 |
| New Competitor 🆕 | 7% | Competition +15, Heat +5 |
| Team Offsite 🏕️ | 5% | Morale +20 |
| Customer Churn 😔 | 6% | Users -15, Revenue -5, Heat -5 |
| Technical Breakthrough 🧪 | 4% | Product +20, Heat +10, Morale +10 |

**Design rationale**: Events add unpredictability. Bad events (poach, crash, churn) punish complacency. Good events (viral, breakthrough) reward risk-taking. The probabilities are tuned so roughly 1-2 events fire per month on average.

---

## 8. Win/Lose Conditions

### Failure Conditions (checked first)
| Condition | Reason |
|-----------|--------|
| Funds ≤ $0 | "Out of funds! Your startup ran out of money." |
| Morale ≤ 10 | "Team morale collapsed. Everyone quit!" |
| Month > 36 | "Time's up! Failed to achieve product-market fit within 3 years." |

### Success Conditions (multiple paths to victory)
| Condition | Reason |
|-----------|--------|
| Product ≥ 80, Users ≥ 100, Heat ≥ 60 | "Product-market fit achieved!" |
| Revenue ≥ 50, Users ≥ 150, Heat ≥ 70 | "Unicorn status! Valued at $1B+" |
| Funds ≥ $500K, Product ≥ 70, Users ≥ 80 | "Series A complete!" |
| Month ≥ 24, Product ≥ 60, Users ≥ 50, Funds > $100K | "Profitable and sustainable!" |

**Design rationale**: Four different victory paths allow different playstyles:
- **Product-driven**: Focus on Product Dev + User Research
- **Growth-driven**: Focus on Marketing + Partnerships
- **Capital-driven**: Focus on building traction → smart fundraising → scaling (no longer "just fundraise")
- **Steady-state**: Balanced approach, survive 24 months with healthy metrics

---

## 9. Metric Interdependency Diagram

```
Market Heat ──────→ User Growth (×0.3)
     ↑                      ↓
  Decisions              Revenue Growth (×0.02)
     ↑                      ↓
Competition ──→ Suppresses Heat    Funds ←── Decisions & Burn Cost
                      ↑
              (indirect: fundraising raises competition)
```

**Key chain**: Heat → Users → Revenue → Sustainable growth

**Key brakes**: Competition → suppresses Heat; Burn Rate → suppresses Morale

---

## 10. Strategic Guide

### Early Game (Months 1-6)
- Priority: Product + Research
- Best decisions: User Research, Product Development
- Avoid: Fundraising (locked behind product/users requirements)
- Goal: Get product to 30%+, users to 20+, unlock fundraising

### Mid Game (Months 7-18)
- Priority: Growth + First Fundraising Round
- Best decisions: Marketing, Partnerships, Fundraising (when unlocked)
- Watch: Burn rate (don't let it exceed 30); fundraising cooldown
- Goal: Reach 50+ users, 30+ heat, raise first round at peak valuation

### Late Game (Months 19-36)
- Priority: Scaling or Stabilizing
- If ahead: Marketing + Fundraising (2nd/3rd round at diminishing returns)
- If behind: Cost Optimization + Product Dev to stabilize
- Goal: Hit any victory condition before month 36
- Note: Later fundraising rounds yield less — rely on revenue growth instead

---

## 11. Technical Architecture

### Frontend (React + TypeScript)

```
src/
├── types/game.ts              # TypeScript type definitions
├── config/
│   ├── constants.ts           # Game balance constants
│   └── decisions.ts           # Decision & event definitions
├── engine/
│   ├── calculator.ts          # Metric calculations
│   ├── validator.ts           # Decision validation
│   ├── events.ts              # Random event system
│   ├── conditions.ts          # Win/lose conditions
│   └── processor.ts           # Monthly processing
├── services/
│   ├── api.ts                 # Backend API client
│   └── ai.service.ts          # LLM integration
├── hooks/useGameState.ts      # State reducer
├── context/
│   ├── GameContext.tsx         # Game state context
│   └── AuthContext.tsx         # Auth state context
├── components/
│   ├── ui/
│   │   ├── ErrorBoundary.tsx    # Global error handling
│   │   ├── GameErrorBoundary.tsx # Component-level error handling
│   │   └── Skeleton.tsx         # Loading skeleton components
│   ├── auth/LoginForm.tsx      # Login/Register UI
│   └── game/                   # Game UI components
├── App.tsx
└── main.tsx
```
src/
├── types/game.ts              # TypeScript type definitions
├── config/
│   ├── constants.ts           # Game balance constants
│   └── decisions.ts           # Decision & event definitions
├── engine/
│   ├── calculator.ts          # Metric calculations
│   ├── validator.ts           # Decision validation
│   ├── events.ts              # Random event system
│   ├── conditions.ts          # Win/lose conditions
│   └── processor.ts           # Monthly processing
├── services/
│   ├── api.ts                 # Backend API client
│   └── ai.service.ts          # LLM integration
├── hooks/useGameState.ts      # State reducer
├── context/GameContext.tsx     # Global state
├── components/
│   ├── ui/ErrorBoundary.tsx    # Error handling
│   └── game/                   # Game UI components
│       ├── CreateCompany.tsx
│       ├── GameBoard.tsx
│       ├── Dashboard.tsx
│       ├── DecisionPanel.tsx
│       ├── MonthlyReport.tsx
│       ├── EventNotification.tsx
│       └── EndGame.tsx
├── App.tsx
└── main.tsx
```

### Backend (Node.js + Express)

```
server/
├── index.ts                   # Express server entry
├── db.ts                      # SQLite database setup + compression
├── middleware/
│   ├── rateLimit.ts           # API rate limiting
│   └── validateState.ts       # Game state validation
├── routes/
│   ├── auth.ts                # JWT authentication
│   ├── game.ts                # Game CRUD + history
│   ├── ai.ts                  # LLM API proxy
│   ├── leaderboard.ts         # Score rankings
│   └── storage.ts             # Storage stats + cleanup
├── package.json               # Server-only dependencies
└── tsconfig.json
```

### Database Schema

```sql
users (id, username, password_hash, created_at)
games (id, user_id, company_name, industry, state, is_active, ...)
game_history (id, game_id, month, state_snapshot, decisions, events, ...)
leaderboard (id, user_id, game_id, company_name, score, result, ...)
```

### LLM Integration

Frontend calls `POST /api/ai/report` which proxies to OpenAI API. Falls back to mock reports if API key is not configured.

### Decision System Features

The decision engine supports three advanced mechanisms:

1. **Dynamic Effects** (`dynamicEffect`): Decisions can calculate effects based on current game state. Fundraising uses this to scale funding amount with company metrics.
2. **Cooldowns** (`cooldown`): After using a decision, it's unavailable for N months. Fundraising has 3-month cooldown.
3. **Requirements** (`require`): Minimum stat thresholds must be met. Fundraising requires product ≥ 30 and users ≥ 20.

---

## 12. Numerical Balance Notes

- **Starting runway**: ~5 months at base burn rate. Forces early action.
- **Most expensive decision**: Marketing (20% of funds). Reflects real ad costs.
- **Cheapest decision**: User Research (8%). Rewards information gathering.
- **Fundraising is gated**: Requires product ≥ 30, users ≥ 20, and 3-month cooldown. Dynamic funding formula ensures diminishing returns.
- **No free lunch**: Every positive effect has at least one negative side effect.
- **Burn rate ceiling**: At 30+, morale starts decaying. At 50+, it decays faster. Forces balance between growth and sustainability.
- **Competition is permanent**: Unlike other metrics, competition has no natural decay. Once the market gets crowded, you must differentiate (Partnerships) or outpace it (Marketing).
- **Fundraising exploit patched**: Original design allowed infinite $195K net gain per round. Now: threshold gate + cooldown + diminishing returns + scaling cost.

---

## 13. Changelog

### v1.1 — Fundraising Balance Patch
**Problem**: Fundraising gave fixed +$200K for only $5K cost, allowing infinite money exploit.

**Fix**: Three-layer restriction system:
- Added `require` field: product ≥ 30, users ≥ 20
- Added `cooldown` field: 3 months between fundraising rounds
- Changed to `dynamicEffect`: funding amount = 80K + product×1.5K + users×0.5K + heat×0.8K - roundCount×30K
- Increased competition penalty: +8 → +12
- Cost changed from fixed $5K to 5% of funds + $10K base

**Impact**: Players must now build product and users first. Fundraising becomes a mid-game tool, not an early-game exploit.

### v1.2 — Difficulty Rebalance
**Problem**: Game was too hard — almost all strategies failed within 3-5 months due to insufficient starting capital and high burn rate.

**Fix**:
- Starting funds: $100K → $200K ( doubled runway)
- Base burn rate: 10 → 8 (lower monthly cost)
- Burn cost formula: rate × $2,000 → rate × $1,500 (25% reduction)
- Product Dev cost: 15% → 12% of funds
- Marketing cost: 20% → 18% of funds
- Hiring cost: 12% → 10% of funds
- Hiring burn rate: +4 → +3
- Marketing burn rate: +3 → +2
- Product Dev burn rate: +2 → +1

**Impact**: Multiple strategies can now win (Research spam, Balanced growth, Partnerships, Low burn). Pure fundraising still can't win due to competition cap. Game is winnable but requires strategic decisions.

### v1.3 — TypeScript + Backend
**Changes**:
- Migrated frontend to TypeScript with strict mode
- Added Context + useReducer state management
- Split game engine into modular files (calculator, validator, events, conditions, processor)
- Added Express backend with SQLite
- Added JWT authentication
- Added game state persistence
- Added OpenAI API integration for AI reports
- Added leaderboard system

### v1.4 — Production Hardening
**Changes**:
- Added rate limiting (60 requests/minute per IP)
- Added game state validation on backend
- Added Docker deployment configuration
- Added database compression and cleanup utilities
- Added storage stats API endpoint
- Optimized SQLite settings for local deployment

### v1.5 — Bug Fixes
**Changes**:
- Fixed server TypeScript compilation errors
- Fixed validateState middleware to use local constants
- Fixed Request import in leaderboard and storage routes
- Fixed db.ts type annotation for better-sqlite3
- Removed broken start.ts file

### v1.6 — Quality Assurance
**Changes**:
- Added Vitest unit tests (38 tests covering engine logic)
- Added loading skeleton components (Dashboard, DecisionPanel, GameBoard)
- Added component-level error boundaries (GameErrorBoundary)
- Updated README with test instructions

### v1.7 — New Features
**Changes**:
- Added achievement system (14 milestones)
- Added industry news system (10 news types)
- Added competitor AI (3 strategies)
- Added tech tree (10 technologies)
- Updated Company type with new fields
- Updated monthly report with news/competitor/achievement info

### v1.8 — Data Management
**Changes**:
- Added cleanup script (scripts/cleanup.sh)
- Added auto-cleanup toggle in game selector (default off)
- Added delete all user data button with confirmation
- Added storage stats display in game selector
- Added AUTO_CLEANUP env var for server startup cleanup
- Added deleteUserGameData function in db.ts
