import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import gameRoutes from './routes/game'
import aiRoutes from './routes/ai'
import leaderboardRoutes from './routes/leaderboard'
import storageRoutes from './routes/storage'
import { rateLimiter } from './middleware/rateLimit'
import { cleanupOldGames } from './db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const AUTO_CLEANUP = process.env.AUTO_CLEANUP === 'true'

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(rateLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/storage', storageRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (AUTO_CLEANUP) {
  cleanupOldGames(90)
  console.log('🧹 Auto-cleanup: removed games older than 90 days')
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 API: POST /api/auth/register, POST /api/auth/login`)
  console.log(`🎮 Games: GET/POST /api/games`)
  console.log(`🤖 AI: POST /api/ai/report`)
  console.log(`🏆 Leaderboard: GET /api/leaderboard`)
  console.log(`💾 Storage: GET /api/storage/stats`)
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 API: POST /api/auth/register, POST /api/auth/login`)
  console.log(`🎮 Games: GET/POST /api/games`)
  console.log(`🤖 AI: POST /api/ai/report`)
  console.log(`🏆 Leaderboard: GET /api/leaderboard`)
})