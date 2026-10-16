import { Router } from 'express'
import { cleanupOldGames, type GameDatabase } from '../db'

export function createStorageRouter(db: GameDatabase) {
  const router = Router()
  router.get('/stats',(req,res) => {
    const games = db.prepare('SELECT COUNT(*) AS count,COALESCE(SUM(length(state)),0) AS bytes FROM games WHERE user_id=?').get(req.userId) as {count:number;bytes:number}
    const history = db.prepare(`SELECT COUNT(*) AS count,COALESCE(SUM(length(state_snapshot)+length(COALESCE(decisions,''))+length(COALESCE(events,''))),0) AS bytes
      FROM game_history WHERE game_id IN (SELECT id FROM games WHERE user_id=?)`).get(req.userId) as {count:number;bytes:number}
    const total = games.bytes + history.bytes
    res.json({games:games.count,historyEntries:history.count,totalSize:total < 1024 ? `${total} B` : `${(total/1024).toFixed(1)} KB`})
  })
  router.post('/cleanup',(req,res) => {
    const deleted = cleanupOldGames(db,90,req.userId!)
    res.json({success:true,deleted,message:`Removed ${deleted} of your inactive games older than 90 days`})
  })
  return router
}
