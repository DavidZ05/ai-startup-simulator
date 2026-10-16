import { useCallback, useReducer, useRef, type ReactNode } from 'react'
import { GameContext } from './useGame'
import { initialGameState, gameReducer } from '../state/game'
import type { UiAction } from '../state/game'
import type { CompanyInput, GameSnapshot } from '../types/api'
import type { Decision, MonthResult } from '../types/game'
import { api } from '../services/api'
import { sounds } from '../utils/sounds'

export function GameProvider({children}: {children:ReactNode}) {
  const [state,dispatch] = useReducer(gameReducer,initialGameState)
  const busy = useRef(false)
  const latest = useRef(state)
  latest.current = state
  const run = useCallback(async (work:() => Promise<void>) => {
    if (busy.current) return
    busy.current = true
    dispatch({type:'BUSY'})
    try { await work() } catch (error) {
      dispatch({type:'ERROR',message:error instanceof Error ? error.message : 'Unable to complete this action'})
    } finally { busy.current = false }
  },[])
  const sync = useCallback((snapshot:GameSnapshot, report?:MonthResult) => {
    const current = latest.current
    dispatch({type:'SYNC',game:{id:current.gameId!,company_name:snapshot.company.name,industry:snapshot.company.industry,is_active:snapshot.endCondition ? 0 : 1,updated_at:'',state:snapshot},report})
  },[])
  const decide = useCallback((decisions:Decision[]) => run(async () => {
    const current = latest.current
    if (!current.gameId) throw new Error('Load a company before taking an action')
    const result = await api.processTurn(current.gameId,decisions,current.revision)
    sync(result.snapshot,result)
  }),[run,sync])
  const purchase = useCallback((kind:'tech'|'market'|'employee',id:string) => run(async () => {
    const current = latest.current
    if (!current.gameId) throw new Error('Load a company before taking an action')
    const result = await api.purchase(current.gameId,kind,id,current.revision)
    sync(result.snapshot)
    sounds.coin()
  }),[run,sync])
  const buyTech = useCallback((id:string) => purchase('tech',id),[purchase])
  const expandMarket = useCallback((id:string) => purchase('market',id),[purchase])
  const hireEmployee = useCallback((id:string) => purchase('employee',id),[purchase])
  const exitGame = useCallback((type:'ipo'|'acquisition',offerId?:string) => run(async () => {
    const current = latest.current
    if (!current.gameId) throw new Error('Load a company before taking an action')
    const result = await api.exit(current.gameId,type,current.revision,offerId)
    sync(result.snapshot)
    sounds.success()
  }),[run,sync])
  const loadGames = useCallback(() => api.getGames(),[])
  const loadGame = useCallback(async (id:number) => {
    const game = await api.getGame(id)
    dispatch({type:'SYNC',game})
  },[])
  const deleteGame = useCallback(async (id:number) => {await api.deleteGame(id)},[])
  const newGame = useCallback((input:CompanyInput) => run(async () => {
    const game = await api.createGame(input)
    dispatch({type:'SYNC',game})
  }),[run])
  // Only presentation actions are exposed to components. All economic state comes from the server.
  const uiDispatch = useCallback((action:UiAction) => {
    if (!busy.current) dispatch(action)
  },[])
  return <GameContext.Provider value={{state,dispatch:uiDispatch,decide,buyTech,expandMarket,hireEmployee,exitGame,loadGames,loadGame,deleteGame,newGame}}>{children}</GameContext.Provider>
}
