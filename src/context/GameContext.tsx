import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { Company, GamePhase, EndCondition, Decision } from '../types/game'
import { processMonth } from '../engine/processor'
import { api } from '../services/api'

const STORAGE_PREFIX = 'startup_sim_'

function saveToLocal(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function loadFromLocal(key: string): unknown {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

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
  gameId: number | null
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
  gameId: null,
}

export type GameAction =
  | { type: 'START_GAME'; company: Company; gameId: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'PROCESS_MONTH'; decisions: Decision[] }
  | { type: 'MONTH_PROCESSED'; result: ReturnType<typeof processMonth> }
  | { type: 'CLOSE_REPORT' }
  | { type: 'SET_EVENT'; event: { title: string; description: string } | null }
  | { type: 'END_GAME'; result: EndCondition; company: Company }
  | { type: 'RESTART' }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialGameState,
        phase: 'game',
        company: action.company,
        history: [action.company],
        gameId: action.gameId,
      }

    case 'LOAD_GAME':
      return action.state

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

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  saveGame: () => Promise<void>
  loadGames: () => Promise<Array<{ id: number; company_name: string; industry: string; updated_at: string }>>
  loadGame: (gameId: number) => Promise<void>
  deleteGame: (gameId: number) => Promise<void>
  newGame: (company: Company) => Promise<void>
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  const saveGame = useCallback(async () => {
    if (!state.gameId || !state.company) return
    const gameData = {
      company: state.company,
      history: state.history,
      turn: state.turn,
    }
    try {
      await api.updateGame(state.gameId, gameData)
    } catch {
      saveToLocal(`game_${state.gameId}`, gameData)
    }
  }, [state.gameId, state.company, state.history, state.turn])

  const loadGames = useCallback(async () => {
    return api.getGames()
  }, [])

  const loadGame = useCallback(async (gameId: number) => {
    let savedState: any
    try {
      const game = await api.getGame(gameId)
      savedState = game.state
    } catch {
      savedState = loadFromLocal(`game_${gameId}`)
      if (!savedState) {
        throw new Error('Game not found')
      }
    }
    dispatch({
      type: 'LOAD_GAME',
      state: {
        ...initialGameState,
        phase: 'game',
        company: savedState.company,
        history: savedState.history || [savedState.company],
        turn: savedState.turn || 1,
        gameId: gameId,
      },
    })
  }, [])

  const deleteGame = useCallback(async (gameId: number) => {
    await api.deleteGame(gameId)
  }, [])

  const newGame = useCallback(async (company: Company) => {
    const result = await api.createGame(company.name, company.industry, {
      company,
      history: [company],
      turn: 1,
    })
    dispatch({ type: 'START_GAME', company, gameId: result.id })
  }, [])

  return (
    <GameContext.Provider value={{ state, dispatch, saveGame, loadGames, loadGame, deleteGame, newGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}