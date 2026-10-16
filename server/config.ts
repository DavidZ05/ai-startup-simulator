import { randomBytes } from 'node:crypto'

export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const production = env.NODE_ENV === 'production'
  const configured = env.JWT_SECRET
  const strong = configured && configured.length >= 32 && !/your-|change.in.production|dev-secret/i.test(configured)
  if (production && !strong) throw new Error('JWT_SECRET must be a non-placeholder secret with at least 32 characters in production')
  const port = Number(env.PORT || 3001)
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT')
  const origins = (env.CORS_ORIGIN || (production ? '' : 'http://localhost:5173,http://127.0.0.1:5173'))
    .split(',').map(origin => origin.trim()).filter(Boolean)
  if (production && !origins.length) throw new Error('CORS_ORIGIN is required in production')
  return {
    port, production, origins,
    jwtSecret: strong ? configured : randomBytes(48).toString('hex'),
    databasePath: env.DATABASE_PATH || './data/game.db',
    autoCleanup: env.AUTO_CLEANUP === 'true',
    frontendPath: env.FRONTEND_DIST,
  }
}
export type ServerConfig = ReturnType<typeof readConfig>
