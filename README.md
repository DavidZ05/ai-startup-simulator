# AI Startup Simulator

A turn-based business simulation game where you build a startup from seed to success.

## Quick Start

```bash
cd mini-game-demo
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

## Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- No backend required (mock AI, all client-side)

## Project Structure

```
mini-game-demo/
├── src/
│   ├── App.jsx                    # Screen router (create → game → end)
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Tailwind + custom animations
│   ├── game/
│   │   ├── decisions.js           # 8 decisions, 10 events, win/lose conditions
│   │   ├── engine.js              # Monthly processing logic
│   │   └── ai.js                  # Mock AI reports (LLM-ready)
│   └── components/
│       ├── CreateCompany.jsx      # 3-step company creation wizard
│       ├── GameBoard.jsx          # Main game interface
│       ├── Dashboard.jsx          # 7-metric progress bars
│       ├── DecisionPanel.jsx      # Decision selection (3 per round)
│       ├── MonthlyReport.jsx      # AI report modal
│       ├── EventNotification.jsx  # Random event toast
│       └── EndGame.jsx            # Victory/defeat screen
├── DESIGN.md                      # Full game design document
└── src/game/balance-test.js       # Balance simulation script
```

## How to Play

1. **Create your startup** — name, industry, target users
2. **Each round = 1 month** — choose 3 business decisions
3. **Watch your metrics** — funds, users, revenue, morale, product, heat, competition
4. **Random events** — viral moments, server crashes, competitor entries
5. **Win** — achieve product-market fit, unicorn status, or profitability within 36 months
6. **Lose** — run out of money, team quits, or timeout

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

## LLM Integration

The game uses mock AI reports. To integrate a real LLM, edit `src/game/ai.js`:

```javascript
export async function generateLLMReport(state, decisions, events) {
  const response = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, decisions, events })
  })
  return await response.json()
}
```

## Balance Testing

Run the simulation to verify game balance:

```bash
node src/game/balance-test.js
```