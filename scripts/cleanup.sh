#!/bin/bash

# Game Data Cleanup Script
# Usage: ./cleanup.sh [days]
# Default: cleanup games older than 90 days

DAYS=${1:-90}
DB_PATH="./data/game.db"

if [ ! -f "$DB_PATH" ]; then
  echo "❌ Database not found at $DB_PATH"
  exit 1
fi

echo "🧹 Cleaning up games older than $DAYS days..."

# Count before cleanup
GAMES_BEFORE=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM games;")
HISTORY_BEFORE=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM game_history;")

# Delete old history first (foreign key constraint)
sqlite3 "$DB_PATH" "DELETE FROM game_history WHERE game_id IN (SELECT id FROM games WHERE updated_at < datetime('now', '-$DAYS days') AND is_active = 0);"

# Delete old inactive games
sqlite3 "$DB_PATH" "DELETE FROM games WHERE updated_at < datetime('now', '-$DAYS days') AND is_active = 0;"

# Delete orphaned history
sqlite3 "$DB_PATH" "DELETE FROM game_history WHERE game_id NOT IN (SELECT id FROM games);"

# Count after cleanup
GAMES_AFTER=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM games;")
HISTORY_AFTER=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM game_history;")

# Vacuum to reclaim space
sqlite3 "$DB_PATH" "VACUUM;"

# Get database size
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)

echo "✅ Cleanup complete!"
echo "   Games: $GAMES_BEFORE → $GAMES_AFTER"
echo "   History: $HISTORY_BEFORE → $HISTORY_AFTER"
echo "   Database size: $DB_SIZE"