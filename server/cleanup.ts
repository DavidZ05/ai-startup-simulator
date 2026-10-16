import 'dotenv/config'
import { createDatabase, cleanupOldGames } from './db'
import { readConfig } from './config'

const days = Number(process.argv[2] || 90)
if (!Number.isSafeInteger(days) || days < 1) throw new Error('Retention days must be a positive integer')
const db = createDatabase(readConfig().databasePath)
try { console.log(`Deleted ${cleanupOldGames(db,days)} inactive games older than ${days} days`) }
finally { db.close() }
