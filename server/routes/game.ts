import { Router } from 'express'
import type { GameDatabase } from '../db'
import { deleteUserGameData } from '../db'
import { GameService, GameError } from '../services/games'

export function createGameRouter(db: GameDatabase) {
  const router = Router()
  const games = new GameService(db)
  const id = (value: unknown) => {
    const result = Number(value)
    if (!Number.isSafeInteger(result) || result <= 0) throw new GameError(400,'Invalid game ID')
    return result
  }
  router.get('/',(req,res) => res.json(games.list(req.userId!)))
  router.post('/',(req,res) => res.status(201).json(games.create(req.userId!,req.body)))
  router.delete('/user/all',(req,res) => {
    deleteUserGameData(db,req.userId!)
    res.json({success:true})
  })
  router.get('/:id',(req,res) => res.json(games.get(req.userId!,id(req.params.id))))
  router.put('/:id',(_req,res) => res.status(405).json({error:'Saved state is server-owned. Use game action endpoints.'}))
  router.post('/:id/turn',(req,res) => res.json(games.turn(req.userId!,id(req.params.id),req.body?.revision,req.body?.decisions)))
  router.post('/:id/purchase',(req,res) => res.json(games.purchase(req.userId!,id(req.params.id),req.body?.revision,req.body?.type,req.body?.id)))
  router.post('/:id/exit',(req,res) => res.json(games.exit(req.userId!,id(req.params.id),req.body?.revision,req.body?.type,req.body?.offerId)))
  router.get('/:id/history',(req,res) => res.json(games.history(req.userId!,id(req.params.id))))
  router.post('/:id/history',(_req,res) => res.status(405).json({error:'History is recorded by the server'}))
  router.delete('/:id',(req,res) => {
    games.delete(req.userId!,id(req.params.id))
    res.json({success:true})
  })
  return router
}
