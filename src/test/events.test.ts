import { describe, it, expect } from 'vitest'
import { triggerRandomEvents } from '../engine/events'
import { EVENTS } from '../config/decisions'

describe('triggerRandomEvents', () => {
  it('returns array', () => {
    const result = triggerRandomEvents(EVENTS)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns events with valid structure', () => {
    const result = triggerRandomEvents(EVENTS)
    for (const event of result) {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('title')
      expect(event).toHaveProperty('description')
      expect(event).toHaveProperty('effects')
      expect(event).toHaveProperty('probability')
    }
  })

  it('does not return duplicate events', () => {
    const result = triggerRandomEvents(EVENTS)
    const ids = result.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})