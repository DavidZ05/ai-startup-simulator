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

export function generateAIMockReport(state, decisions, events) {
  const templates = state.funds < 50000 ? REPORT_TEMPLATES.critical :
    state.marketHeat > 60 ? REPORT_TEMPLATES.thriving :
    state.month < 3 ? REPORT_TEMPLATES.opening :
    REPORT_TEMPLATES.progress

  const template = templates[Math.floor(Math.random() * templates.length)]

  let report = template
    .replace(/{company}/g, state.name)
    .replace(/{industry}/g, state.industry)
    .replace(/{funds}/g, `$${state.funds.toLocaleString()}`)
    .replace(/{users}/g, state.users)
    .replace(/{month}/g, state.month)

  if (decisions.length > 0) {
    report += `\n\nThis month you invested in: ${decisions.map(d => d.name).join(', ')}.`
  }

  if (events.length > 0) {
    report += `\n\nNotable events:\n${events.map(e => `• ${e.title}`).join('\n')}`
  }

  return report
}

export function generateMonthSummary(state) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `Month ${state.month - 1} — ${months[(state.month - 2) % 12]}, Year ${Math.floor((state.month - 2) / 12) + 1}`
}

export async function generateLLMReport(state, decisions, events) {
  // Placeholder for real LLM API integration
  // In production, this would call an actual LLM endpoint
  // const response = await fetch('/api/generate-report', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ state, decisions, events })
  // })
  // return await response.json()

  return generateAIMockReport(state, decisions, events)
}