import { api } from './api'
import type { Company, Decision, GameEvent } from '../types/game'

export async function generateLLMReport(
  state: Company,
  decisions: Decision[],
  events: GameEvent[]
): Promise<string> {
  try {
    const data = await api.generateReport(state, decisions, events)
    return data.report
  } catch (error) {
    console.warn('LLM API failed, using fallback:', error)
    return generateFallbackReport(state, decisions, events)
  }
}

function generateFallbackReport(state: Company, decisions: Decision[], events: GameEvent[]): string {
  const templates = state.funds < 50000
    ? ["{name} faces headwinds with only ${funds} remaining."]
    : state.marketHeat > 60
    ? ["{name} is thriving! Market momentum is strong."]
    : ["{name} continues to build in the {industry} space."]

  const template = templates[0]
  const decisionNames = decisions.map(d => d.name).join(' and ')

  let report = template
    .replace('{name}', state.name)
    .replace('{industry}', state.industry)
    .replace('${funds}', `$${state.funds.toLocaleString()}`)

  report += ` Decisions: ${decisionNames}.`

  if (events.length > 0) {
    report += ` Events: ${events.map(e => e.title).join(', ')}.`
  }

  return report
}