import type { GameEvent } from '../types/game'

export function triggerRandomEvents(events: GameEvent[]): GameEvent[] {
  const triggered: GameEvent[] = []

  for (const event of events) {
    if (Math.random() < event.probability) {
      triggered.push(event)
    }
  }

  return triggered
}