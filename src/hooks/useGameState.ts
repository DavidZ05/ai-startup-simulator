import type { Company, GamePhase, EndCondition, Decision } from '../types/game'
import { GAME_CONFIG } from '../config/constants'
import { processMonth } from '../engine/processor'

export interface GameState {
  phase: GamePhase
  company: Company | null
  history: Company[]
  currentReport: ReturnType<typeof processMonth> | null
  currentEvent: { title: string; description: string } | null
  turn: number
  processing: boolean
  endResult: EndCondition | null
  endCompany: Company | null
}

export const initialGameState: GameState = {
  phase: 'create',
  company: null,
  history: [],
  currentReport: null,
  currentEvent: null,
  turn: 1,
  processing: false,
  endResult: null,
  endCompany: null,
}

export type GameAction =
  | { type: 'START_GAME'; company: Company }
  | { type: 'PROCESS_MONTH'; decisions: Decision[] }
  | { type: 'MONTH_PROCESSED'; result: ReturnType<typeof processMonth> }
  | { type: 'CLOSE_REPORT' }
  | { type: 'SET_EVENT'; event: { title: string; description: string } | null }
  | { type: 'END_GAME'; result: EndCondition; company: Company }
  | { type: 'RESTART' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialGameState,
        phase: 'game',
        company: action.company,
        history: [action.company],
      }

    case 'PROCESS_MONTH':
      return { ...state, processing: true }

    case 'MONTH_PROCESSED': {
      const { result } = action
      const newHistory = [...state.history, result.state]

      return {
        ...state,
        company: result.state,
        history: newHistory,
        currentReport: result,
        processing: false,
        currentEvent: result.events.length > 0
          ? result.events[Math.floor(Math.random() * result.events.length)]
          : null,
      }
    }

    case 'CLOSE_REPORT':
      return {
        ...state,
        currentReport: null,
        currentEvent: null,
        turn: state.turn + 1,
      }

    case 'SET_EVENT':
      return { ...state, currentEvent: action.event }

    case 'END_GAME':
      return {
        ...state,
        phase: 'end',
        endResult: action.result,
        endCompany: action.company,
      }

    case 'RESTART':
      return initialGameState

    default:
      return state
  }
}