import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import path from 'node:path'
import type { GameDatabase } from './db'
import type { ServerConfig } from './config'
import { createAuthRouter } from './routes/auth'
import { createGameRouter } from './routes/game'
import { createLeaderboardRouter } from './routes/leaderboard'
import { createStorageRouter } from './routes/storage'
import { createAuthMiddleware } from './middleware/auth'
import { createRateLimiter } from './middleware/rateLimit'
import { GameError } from './services/games'

export function createApp(db: GameDatabase, config: ServerConfig) {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({origin:config.origins,credentials:true}))
  app.use(express.json({limit:'256kb'}))
  app.use('/api',(_req,res,next) => { res.set('Cache-Control','no-store'); next() })
  app.use('/api',createRateLimiter())
  const authenticate = createAuthMiddleware(db,config.jwtSecret)
  app.get('/api/health',(_req,res) => res.json({status:'ok'}))
  app.use('/api/auth',createAuthRouter(db,config.jwtSecret))
  app.use('/api/games',authenticate,createGameRouter(db))
  app.use('/api/leaderboard',createLeaderboardRouter(db,authenticate))
  app.use('/api/storage',authenticate,createStorageRouter(db))
  if (config.frontendPath) {
    const frontend = path.resolve(config.frontendPath)
    app.use(express.static(frontend))
    app.get('/{*page}',(req,res,next) => {
      if (req.path.startsWith('/api') || path.extname(req.path)) return next()
      res.sendFile(path.join(frontend,'index.html'))
    })
  }
  app.use((_req,res) => res.status(404).json({error:'Not found'}))
  const errors: ErrorRequestHandler = (error,_req,res,_next) => {
    if (error instanceof GameError) return void res.status(error.status).json({error:error.message})
    if (error?.type === 'entity.too.large') return void res.status(413).json({error:'Request is too large'})
    if (error instanceof SyntaxError && 'body' in error) return void res.status(400).json({error:'Invalid JSON'})
    console.error('Request failed:',error)
    res.status(500).json({error:'Internal server error'})
  }
  app.use(errors)
  return app
}
