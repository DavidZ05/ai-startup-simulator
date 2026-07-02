

export interface Competitor {
  id: string
  name: string
  strength: number
  strategy: 'aggressive' | 'balanced' | 'conservative'
}

const COMPETITOR_NAMES = [
  'TechCorp', 'InnovateCo', 'FutureLabs', 'DigitalEdge', 'NextWave',
  'ByteForce', 'CloudNine', 'DataPulse', 'QuantumLeap', 'SynthAI',
]

const STRATEGIES: Array<'aggressive' | 'balanced' | 'conservative'> = [
  'aggressive', 'balanced', 'conservative',
]

export function generateCompetitor(month: number): Competitor | null {
  if (month % 6 !== 0 || Math.random() > 0.4) return null

  const name = COMPETITOR_NAMES[Math.floor(Math.random() * COMPETITOR_NAMES.length)]
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]
  const strength = Math.floor(Math.random() * 30) + 10

  return {
    id: `comp-${Date.now()}`,
    name,
    strength,
    strategy,
  }
}

export function competitorAction(
  competitor: Competitor,
  playerHeat: number
): { heatChange: number; competitionChange: number } {
  let heatChange = 0
  let competitionChange = 0

  switch (competitor.strategy) {
    case 'aggressive':
      heatChange = Math.round(-competitor.strength * 0.1)
      competitionChange = Math.round(competitor.strength * 0.05)
      break
    case 'balanced':
      heatChange = Math.round(-competitor.strength * 0.05)
      competitionChange = Math.round(competitor.strength * 0.03)
      break
    case 'conservative':
      heatChange = Math.round(-competitor.strength * 0.02)
      competitionChange = Math.round(competitor.strength * 0.02)
      break
  }

  if (playerHeat > 60) {
    heatChange = Math.round(heatChange * 1.5)
    competitionChange = Math.round(competitionChange * 1.3)
  }

  return { heatChange, competitionChange }
}