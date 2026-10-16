import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { GameDatabase } from '../db'
import { createAuthMiddleware } from '../middleware/auth'

export function createAuthRouter(db: GameDatabase, secret: string) {
  const router = Router()
  const session = (id: number, username: string) => ({
    token:jwt.sign({userId:id},secret,{expiresIn:'7d',algorithm:'HS256'}), user:{id,username},
  })
  router.post('/register', async (req, res) => {
    const {username, password} = req.body || {}
    if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 32 ||
      typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({error:'Username must be 3–32 characters; password must be at least 8 characters and at most 72 bytes'})
    }
    const name = username.trim()
    const passwordHash = await bcrypt.hash(password, 10)
    // Check and insert synchronously after hashing to avoid concurrent registration races.
    if (db.prepare('SELECT id FROM users WHERE username = ?').get(name)) {
      return res.status(409).json({error:'Username already taken'})
    }
    const result = db.prepare('INSERT INTO users(username,password_hash) VALUES(?,?)').run(name,passwordHash)
    res.status(201).json(session(Number(result.lastInsertRowid),name))
  })
  router.post('/login', async (req, res) => {
    const {username,password} = req.body || {}
    if (typeof username !== 'string' || typeof password !== 'string' || password.length > 128) {
      return res.status(400).json({error:'Username and password required'})
    }
    const user = db.prepare('SELECT id,username,password_hash FROM users WHERE username = ?').get(username.trim()) as
      {id:number;username:string;password_hash:string} | undefined
    if (!user || !await bcrypt.compare(password,user.password_hash)) {
      return res.status(401).json({error:'Invalid credentials'})
    }
    res.json(session(user.id,user.username))
  })
  router.get('/me',createAuthMiddleware(db,secret),(req,res) => {
    res.json(db.prepare('SELECT id,username,created_at FROM users WHERE id = ?').get(req.userId))
  })
  return router
}
