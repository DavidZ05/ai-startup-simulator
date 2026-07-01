import { Router, Request, Response } from 'express'
import { authMiddleware } from './auth'

const router = Router()

interface AuthRequest extends Request {
  userId?: number
}

router.use(authMiddleware)

router.post('/report', async (req: AuthRequest, res: Response) => {
  const { state, decisions, events } = req.body

  if (!state || !decisions) {
    return res.status(400).json({ error: 'Missing state or decisions' })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    const mockReport = generateMockReport(state, decisions, events || [])
    return res.json({ report: mockReport })
  }

  try {
    const prompt = buildPrompt(state, decisions, events)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a startup simulation game AI. Generate concise, engaging monthly reports for the player. Use emojis and keep it under 200 words. Format as a natural narrative.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json() as any
    const report = data.choices[0]?.message?.content || generateMockReport(state, decisions, events)

    res.json({ report })
  } catch (error) {
    console.error('LLM API error:', error)
    const fallbackReport = generateMockReport(state, decisions, events)
    res.json({ report: fallbackReport })
  }
})

function buildPrompt(state: any, decisions: any[], events: any[]): string {
  const decisionNames = decisions.map((d: any) => d.name).join(', ')
  const eventNames = events.map((e: any) => e.title).join(', ') || 'None'

  return `Company: ${state.name} (${state.industry})
Month: ${state.month}
Funds: $${state.funds.toLocaleString()}
Users: ${state.users}
Product: ${state.product}%
Market Heat: ${state.marketHeat}%
Competition: ${state.competition}%
Team Morale: ${state.teamMorale}%
Revenue: ${state.revenue}%

Decisions made this month: ${decisionNames}
Random events: ${eventNames}

Generate a brief, engaging monthly report for this startup. Include:
1. A one-line summary of the month
2. Key highlights or concerns
3. A strategic suggestion

Keep it conversational and use 1-2 emojis.`
}

function generateMockReport(state: any, decisions: any[], events: any[]): string {
  const templates = state.funds < 50000
    ? ["{name} faces headwinds with only ${funds} remaining. Time for tough decisions."]
    : state.marketHeat > 60
    ? ["{name} is thriving! Market momentum is strong."]
    : ["{name} continues to build in the {industry} space."]

  const template = templates[0]
  const decisionNames = decisions.map((d: any) => d.name).join(' and ')

  let report = template
    .replace('{name}', state.name)
    .replace('{industry}', state.industry)
    .replace('${funds}', `$${state.funds.toLocaleString()}`)

  report += `\n\nDecisions: ${decisionNames}.`

  if (events.length > 0) {
    report += ` Events: ${events.map((e: any) => e.title).join(', ')}.`
  }

  if (state.funds > 200000 && state.product > 50) {
    report += ' 💡 Strong position to scale.'
  } else if (state.funds < 80000) {
    report += ' ⚠️ Watch your burn rate.'
  }

  return report
}

export default router