import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

interface AuthRequest extends Request {
  userId?: number
}

function authMiddleware(req: AuthRequest, res: Response, next: Function) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ error: 'Username min 3 chars, password min 6 chars' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)

    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user: { id: result.lastInsertRowid, username } })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user: { id: user.id, username: user.username } })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

export default router
export { authMiddleware }