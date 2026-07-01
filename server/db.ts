import Database, { type Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'

const DB_PATH = process.env.DATABASE_PATH || './data/game.db'

const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const db: DatabaseType = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('cache_size = -8000')
db.pragma('synchronous = NORMAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    state TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    state_snapshot TEXT NOT NULL,
    decisions TEXT,
    events TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    result TEXT NOT NULL,
    months_played INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
  );

  CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
  CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active);
  CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
`)

export function compressState(state: unknown): string {
  const json = JSON.stringify(state)
  const compressed = zlib.gzipSync(Buffer.from(json))
  return compressed.toString('base64')
}

export function decompressState(compressed: string): unknown {
  const buffer = Buffer.from(compressed, 'base64')
  const json = zlib.gunzipSync(buffer).toString()
  return JSON.parse(json)
}

export function cleanupOldGames(maxAgeDays: number = 90) {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString()
  db.prepare('DELETE FROM games WHERE updated_at < ? AND is_active = 0').run(cutoff)
  db.prepare('DELETE FROM game_history WHERE game_id NOT IN (SELECT id FROM games)').run()
}

export function getDbSize(): { tables: Record<string, number>; totalSize: string } {
  const tables: Record<string, number> = {}
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[]

  for (const row of rows) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${row.name}`).get() as any
    tables[row.name] = count.count
  }

  const pageInfo = db.pragma('page_count') as any[]
  const pageSize = db.pragma('page_size') as any[]
  const sizeBytes = pageInfo[0].page_count * pageSize[0].page_size

  let totalSize: string
  if (sizeBytes < 1024) totalSize = `${sizeBytes} B`
  else if (sizeBytes < 1024 * 1024) totalSize = `${(sizeBytes / 1024).toFixed(1)} KB`
  else totalSize = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`

  return { tables, totalSize }
}

export default db