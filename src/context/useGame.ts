import { createContext, useContext, type Dispatch } from 'react'
import type { GameState, UiAction } from '../state/game'
import type { CompanyInput, GameSummary } from '../types/api'
import type { Decision } from '../types/game'

export interface GameContextValue {
  state:GameState
  dispatch:Dispatch<UiAction>
  decide:(decisions:Decision[]) => Promise<void>
  buyTech:(id:string) => Promise<void>
  expandMarket:(id:string) => Promise<void>
  hireEmployee:(id:string) => Promise<void>
  exitGame:(type:'ipo'|'acquisition',offerId?:string) => Promise<void>
  loadGames:() => Promise<GameSummary[]>
  loadGame:(id:number) => Promise<void>
  deleteGame:(id:number) => Promise<void>
  newGame:(input:CompanyInput) => Promise<void>
}
export const GameContext = createContext<GameContextValue|null>(null)
export function useGameContext() {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGameContext requires GameProvider')
  return value
}
