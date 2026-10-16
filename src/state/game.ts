import type { Company, EndCondition, GamePhase, MonthResult } from '../types/game'
import type { GameRecord } from '../types/api'

export interface GameState {
  phase:GamePhase
  company:Company|null
  history:Company[]
  currentReport:MonthResult|null
  currentEvent:{title:string;description:string}|null
  turn:number
  revision:number
  processing:boolean
  error:string|null
  endResult:EndCondition|null
  endCompany:Company|null
  gameId:number|null
}
export const initialGameState: GameState = {
  phase:'create',company:null,history:[],currentReport:null,currentEvent:null,
  turn:1,revision:0,processing:false,error:null,endResult:null,endCompany:null,gameId:null,
}
export type UiAction = {type:'SET_EVENT';event:GameState['currentEvent']} | {type:'CLOSE_REPORT'} | {type:'RESTART'}
export type GameAction = UiAction | {type:'BUSY'} | {type:'ERROR';message:string} |
  {type:'SYNC';game:GameRecord;report?:MonthResult}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUSY': return {...state,processing:true,error:null}
    case 'ERROR': return {...state,processing:false,error:action.message}
    case 'SYNC': {
      const {company,history,turn,revision,endCondition} = action.game.state
      return {
        ...initialGameState,company,history,turn,revision,gameId:action.game.id,
        phase:endCondition ? 'end' : 'game',endResult:endCondition,endCompany:endCondition ? company : null,
        currentReport:action.report || null,currentEvent:action.report?.events[0] || null,
      }
    }
    case 'CLOSE_REPORT': return {...state,currentReport:null,currentEvent:null}
    case 'SET_EVENT': return {...state,currentEvent:action.event}
    case 'RESTART': return {...initialGameState}
  }
}
