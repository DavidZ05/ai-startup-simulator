import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
export type GameDatabase = Database.Database

export function createDatabase(filename: string): GameDatabase {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true })
  const db = new Database(filename)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
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

  return db
}

// Explicitly delete children first so this works with databases created by older versions.
export function deleteGame(db: GameDatabase, userId: number, gameId: number): boolean {
  return db.transaction(() => {
    const game = db.prepare('SELECT id FROM games WHERE id = ? AND user_id = ?').get(gameId, userId)
    if (!game) return false
    db.prepare('DELETE FROM leaderboard WHERE game_id = ?').run(gameId)
    db.prepare('DELETE FROM game_history WHERE game_id = ?').run(gameId)
    db.prepare('DELETE FROM games WHERE id = ? AND user_id = ?').run(gameId, userId)
    return true
  })()
}

export function deleteUserGameData(db: GameDatabase, userId: number) {
  return db.transaction(() => {
    db.prepare('DELETE FROM leaderboard WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM game_history WHERE game_id IN (SELECT id FROM games WHERE user_id = ?)').run(userId)
    db.prepare('DELETE FROM games WHERE user_id = ?').run(userId)
  })()
}

export function cleanupOldGames(db: GameDatabase, days = 90, userId?: number): number {
  if (!Number.isInteger(days) || days < 1) throw new Error('Invalid retention period')
  return db.transaction(() => {
    const rows = db.prepare(`SELECT id, user_id FROM games
      WHERE updated_at < datetime('now', ?) AND is_active = 0
      AND (? IS NULL OR user_id = ?)`)
      .all(`-${days} days`, userId ?? null, userId ?? null) as Array<{id:number;user_id:number}>
    for (const row of rows) deleteGame(db, row.user_id, row.id)
    return rows.length
  })()
}
