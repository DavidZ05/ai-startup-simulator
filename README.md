# AI Startup Simulator

A turn-based business simulation game where you build a startup from seed to success.

## Quick Start

### Frontend Only (Mock AI)
```bash
npm install
npm run dev
```
Open **http://localhost:5173/**

### Full Stack (with Backend)
```bash
# Terminal 1: Backend
cd server
npm install
cp .env.example .env  # Edit with your OpenAI key
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Run Both Together
```bash
npm run dev:all
```

### Run Tests
```bash
npm test
```

### Docker
```bash
docker-compose up
```

## Tech Stack

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS v4**
- **TypeScript** (strict mode)
- **Context + useReducer** state management

### Backend
- **Node.js** + **Express**
- **SQLite** (via better-sqlite3)
- **JWT** authentication
- **OpenAI API** integration (optional)

## Project Structure

```
mini-game-demo/
├── src/                          # Frontend
│   ├── types/game.ts             # TypeScript types
│   ├── config/
│   │   ├── constants.ts          # Game balance constants
│   │   ├── decisions.ts          # Decision & event definitions
│   │   ├── achievements.ts       # Achievement system
│   │   ├── news.ts               # Industry news
│   │   ├── competitors.ts        # Competitor AI
│   │   ├── techTree.ts           # Tech tree
│   │   ├── markets.ts            # Market expansion
│   │   └── employees.ts          # Employee system
│   ├── engine/                   # Game logic
│   │   ├── calculator.ts         # Metric calculations
│   │   ├── validator.ts          # Decision validation
│   │   ├── events.ts             # Random event system
│   │   ├── conditions.ts         # Win/lose conditions
│   │   └── processor.ts          # Monthly processing
│   ├── services/
│   │   └── api.ts                # Backend API client
│   ├── hooks/
│   │   └── useOfflineStorage.ts  # Offline storage hook
│   ├── context/
│   │   ├── GameContext.tsx        # Game state context
│   │   └── AuthContext.tsx        # Auth state context
│   └── components/
│       ├── ui/
│       │   ├── ErrorBoundary.tsx  # Global error boundary
│       │   ├── GameErrorBoundary.tsx # Component error boundary
│       │   ├── Skeleton.tsx       # Loading skeletons
│       │   └── OfflineIndicator.tsx # Online/offline status
│       ├── auth/LoginForm.tsx     # Login/Register UI
│       └── game/
│           ├── GameBoard.tsx      # Main game interface
│           ├── Dashboard.tsx      # Metric dashboard
│           ├── DecisionPanel.tsx  # Decision selection
│           ├── MonthlyReport.tsx  # Monthly report modal
│           ├── QuarterlyReportModal.tsx # Quarterly report
│           ├── EventNotification.tsx # Event toasts
│           ├── AchievementsPanel.tsx # Achievements display
│           ├── TechTreePanel.tsx  # Tech tree panel
│           ├── MarketPanel.tsx    # Market expansion
│           ├── EmployeePanel.tsx  # Employee hiring
│           ├── IPOPanel.tsx       # IPO/Acquisition
│           ├── CreateCompany.tsx  # Company creation wizard
│           ├── GameSelector.tsx   # Game management
│           └── EndGame.tsx        # Victory/defeat screen
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── server/                       # Backend
│   ├── index.ts                  # Express server
│   ├── db.ts                     # SQLite setup
│   ├── middleware/
│   │   ├── rateLimit.ts          # API rate limiting
│   │   └── validateState.ts      # Game state validation
│   └── routes/
│       ├── auth.ts               # JWT authentication
│       ├── game.ts               # Game CRUD
│       ├── ai.ts                 # LLM proxy
│       ├── leaderboard.ts        # Score rankings
│       └── storage.ts            # Storage stats
├── DESIGN.md                     # Game design document
├── API.md                        # API documentation
└── README.md
```

## How to Play

1. **Register** — create account (min 3 chars username, 6 chars password)
2. **Create startup** — name, industry, target users
3. **Each round = 1 month** — choose 3 business decisions
4. **Watch metrics** — funds, users, revenue, morale, product, heat, competition
5. **Expand markets** — unlock 8 global markets (US, EU, Asia, etc.)
6. **Hire employees** — 10 roles from Junior Dev to CTO
7. **Research tech** — unlock 10 technologies in the tech tree
8. **Random events** — viral moments, server crashes, competitor entries
9. **Win** — achieve product-market fit, unicorn status, IPO, or acquisition
10. **Lose** — run out of money, team quits, or timeout

## Game Mechanics

| Metric | Description |
|--------|-------------|
| 💰 Funds | Cash runway (burns monthly) |
| 👥 Users | Active users (grows with market heat) |
| 📈 Revenue | Income percentage (grows with users) |
| ❤️ Team Morale | Team happiness (drops if overworked) |
| 💻 Product | Product completion % |
| 🔥 Market Heat | Brand visibility (drives user growth) |
| ⚔️ Competition | Market competition (suppresses heat) |

## Victory Conditions

| Condition | Requirements |
|-----------|--------------|
| Product-Market Fit | Product ≥ 80%, Users ≥ 100, Heat ≥ 60 |
| Unicorn Status | Revenue ≥ 50%, Users ≥ 150, Heat ≥ 70 |
| Series A | Funds ≥ $500K, Product ≥ 70%, Users ≥ 80 |
| Sustainable | Month ≥ 24, Product ≥ 60%, Users ≥ 50, Funds > $100K |
| IPO | Month ≥ 24, Product ≥ 70%, Users ≥ 100, Funds ≥ $300K |
| Acquisition | Accept offer from tech giant |

## Features

| Feature | Description |
|---------|-------------|
| 🏆 Achievements | 14 milestones to unlock |
| 📰 Industry News | 10 types of monthly market events |
| ⚔️ Competitors | AI rivals with 3 strategies |
| 🌳 Tech Tree | 10 technologies to research |
| 📊 Quarterly Reports | Detailed analysis every 3 months |
| 🌍 Market Expansion | 8 global markets to enter |
| 🏢 Employee System | 10 roles from Junior Dev to CTO |
| 💼 IPO/Acquisition | Exit options for victory |
| 📱 PWA Support | Install as app, offline mode |
| 🔒 Auth System | JWT authentication, game persistence |

## LLM Integration

The game supports OpenAI API for AI-generated reports.

1. Copy `server/.env.example` to `server/.env`
2. Add your OpenAI API key
3. Reports will be generated by GPT-4o-mini
4. Falls back to mock reports if API is unavailable

## Balance Testing

Run the simulation to verify game balance:

```bash
npx tsx src/engine/balance-test.ts
```

## Data Management

```bash
# Delete entire database (resets all data)
rm -rf data/

# Cleanup games older than 90 days
./scripts/cleanup.sh

# Cleanup games older than 30 days
./scripts/cleanup.sh 30

# Enable auto-cleanup on server start
AUTO_CLEANUP=true npm run dev:server
```