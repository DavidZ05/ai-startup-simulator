import type { Company, Decision, GameEvent } from '../types/game'

const REPORT_TEMPLATES = {
  opening: [
    "Welcome to {company}! Your journey in the {industry} space begins now.",
    "Founded in the competitive {industry} market, {company} starts with {funds} in seed funding.",
    "The {industry} landscape is ripe for disruption. {company} aims to change the game.",
  ],
  progress: [
    "Month {month} sees {company} making steady progress in the {industry} market.",
    "With {users} users and {funds} in the bank, {company} continues its {industry} journey.",
    "The team at {company} is focused on growth in the {industry} sector.",
  ],
  critical: [
    "Alert: {company} faces headwinds with only {funds} remaining!",
    "Cash is running low at {company}. Strategic decisions are crucial.",
    "The runway is shrinking. {company} needs to act fast.",
  ],
  thriving: [
    "{company} is thriving with {users} users and strong {industry} market presence!",
    "The {industry} market is responding well to {company}'s approach.",
    "With solid metrics across the board, {company} is positioned for success.",
  ],
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

function generateMockReport(state: Company, decisions: Decision[], events: GameEvent[]): string {
  const templates = state.funds < 50000 ? REPORT_TEMPLATES.critical :
    state.marketHeat > 60 ? REPORT_TEMPLATES.thriving :
    state.month < 3 ? REPORT_TEMPLATES.opening :
    REPORT_TEMPLATES.progress

  const template = templates[Math.floor(Math.random() * templates.length)]

  let report = fillTemplate(template, {
    company: state.name,
    industry: state.industry,
    funds: `$${state.funds.toLocaleString()}`,
    users: String(state.users),
    month: String(state.month),
  })

  if (decisions.length > 0) {
    report += `\n\nThis month you invested in: ${decisions.map(d => d.name).join(', ')}.`
  }

  if (events.length > 0) {
    report += `\n\nNotable events:\n${events.map(e => `• ${e.title}`).join('\n')}`
  }

  return report
}

export async function generateLLMReport(
  state: Company,
  decisions: Decision[],
  events: GameEvent[]
): Promise<string> {
  // Placeholder for real LLM API integration
  // In production, this would call an actual LLM endpoint:
  //
  // const response = await fetch('/api/generate-report', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ state, decisions, events })
  // })
  // const data = await response.json()
  // return data.report

  return generateMockReport(state, decisions, events)
}