import 'dotenv/config'
import { readConfig } from './config'
import { createDatabase, cleanupOldGames } from './db'
import { createApp } from './app'

const config = readConfig()
const db = createDatabase(config.databasePath)
if (config.autoCleanup) cleanupOldGames(db)
const server = createApp(db,config).listen(config.port,() => {
  console.log(`Server running on port ${config.port}`)
})
server.on('error',error => { console.error(error); db.close(); process.exitCode = 1 })
const close = () => server.close(() => {db.close(); process.exitCode = 0})
process.once('SIGTERM',close)
process.once('SIGINT',close)
