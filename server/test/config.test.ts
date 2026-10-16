// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readConfig } from '../config'

describe('Startup configuration', () => {
  it('never falls back to a known signing secret in development', () => {
    const a = readConfig({NODE_ENV:'development',JWT_SECRET:'dev-secret'})
    const b = readConfig({NODE_ENV:'development'})
    expect(a.jwtSecret.length).toBeGreaterThanOrEqual(32)
    expect(a.jwtSecret).not.toBe(b.jwtSecret)
  })
  it('requires a strong non-placeholder secret and explicit origin in production', () => {
    expect(() => readConfig({NODE_ENV:'production'})).toThrow('JWT_SECRET')
    expect(() => readConfig({NODE_ENV:'production',JWT_SECRET:'your-super-secret-key-change-in-production'})).toThrow('JWT_SECRET')
    expect(() => readConfig({NODE_ENV:'production',JWT_SECRET:'x'.repeat(40)})).toThrow('CORS_ORIGIN')
  })
  it('honors supplied secrets and supports both local frontend addresses', () => {
    const config = readConfig({JWT_SECRET:'integration-test-secret-'.repeat(3)})
    expect(config.jwtSecret).toBe('integration-test-secret-'.repeat(3))
    expect(config.origins).toContain('http://127.0.0.1:5173')
    expect(config.origins).toContain('http://localhost:5173')
  })
})
