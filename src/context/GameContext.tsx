import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { Company, GamePhase, EndCondition, Decision, DecisionEffect, MonthResult } from '../types/game'
import { processMonth } from '../engine/processor'
import { TECH_TREE } from '../config/techTree'
import { MARKETS } from '../config/markets'
import { EMPLOYEE_ROLES } from '../config/employees'
import { applyEffects } from '../engine/calculator'
import { sounds } from '../utils/sounds'
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
  currentReport: MonthResult | null
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
  | { type: 'MONTH_PROCESSED'; result: MonthResult }
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
  decide: (decisions: Decision[]) => void
  buyTech: (techId: string) => Promise<void>
  expandMarket: (marketId: string) => Promise<void>
  hireEmployee: (employeeId: string) => Promise<void>
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

  /**
   * 回合编排：进入 processing → 800ms 结算延迟 → MONTH_PROCESSED →
   * （若终局）500ms 后 END_GAME。
   * 结算优先走服务端（防作弊，随机事件由服务端掷骰）；后端不可用时
   * 回退到本地 processMonth，保持离线可玩。
   */
  const decide = useCallback((decisions: Decision[]) => {
    const { company, history, gameId, processing } = state
    if (!company || processing) return

    dispatch({ type: 'PROCESS_MONTH', decisions })

    const settle = async (): Promise<MonthResult> => {
      if (gameId) {
        try {
          // 先把本地购买（科技/市场/雇员）同步上去，服务端从最新状态结算
          await saveGame()
          return await api.processTurn(gameId, decisions)
        } catch {
          // 后端不可用 → 本地结算兜底
        }
      }
      return processMonth(company, decisions, history)
    }

    setTimeout(async () => {
      const result = await settle()
      dispatch({ type: 'MONTH_PROCESSED', result })

      if (result.endCondition) {
        const end = result.endCondition
        // 终局上榜：服务端权威算分（排行榜 route 从 DB 重算，不接前端分）
        if (state.gameId) {
          api.submitScore(state.gameId, end.type).catch(() => {})
        }
        setTimeout(() => {
          dispatch({ type: 'END_GAME', result: end, company: result.state })
        }, 500)
      }
    }, 800)
  }, [state, saveGame])

  /**
   * 购买通用逻辑：优先服务端权威结算；后端不可用回退本地
   * （费用/前置/去重从 config 重建），保持离线可玩。
   */
  const applyPurchaseLocal = useCallback((
    company: Company,
    kind: 'tech' | 'market' | 'employee',
    id: string,
  ): Company => {
    let def: { cost: number; effects: DecisionEffect } | undefined
    let owned: boolean
    if (kind === 'tech') {
      const t = TECH_TREE.find(t => t.id === id)
      def = t
      owned = !!company.unlockedTech?.includes(id)
    } else if (kind === 'market') {
      const m = MARKETS.find(m => m.id === id)
      def = m
      owned = !!company.unlockedMarkets?.includes(id)
    } else {
      const e = EMPLOYEE_ROLES.find(e => e.id === id)
      def = e
      owned = !!company.employees?.includes(id)
    }
    if (!def || owned || company.funds < def.cost) return company

    let next: Company = { ...company, funds: company.funds - def.cost }
    next = applyEffects(next, def.effects)
    if (kind === 'tech') next.unlockedTech = [...(company.unlockedTech || []), id]
    else if (kind === 'market') next.unlockedMarkets = [...(company.unlockedMarkets || []), id]
    else next.employees = [...(company.employees || []), id]
    return next
  }, [])

  const doPurchase = useCallback(async (
    kind: 'tech' | 'market' | 'employee',
    id: string,
    sfx: () => void,
  ) => {
    const company = state.company
    if (!company) return
    sfx()

    let nextCompany: Company | null = null
    if (state.gameId) {
      try {
        const r = await api.purchase(state.gameId, kind, id)
        nextCompany = r.company
      } catch {
        // 后端不可用 → 本地兜底
      }
    }
    if (!nextCompany) {
      nextCompany = applyPurchaseLocal(company, kind, id)
    }

    if (nextCompany !== company) {
      dispatch({
        type: 'LOAD_GAME',
        state: { ...state, company: nextCompany },
      })
    }
  }, [state, applyPurchaseLocal])

  const buyTech = useCallback((techId: string) =>
    doPurchase('tech', techId, () => sounds.levelUp()), [doPurchase])

  const expandMarket = useCallback((marketId: string) =>
    doPurchase('market', marketId, () => sounds.success()), [doPurchase])

  const hireEmployee = useCallback((employeeId: string) =>
    doPurchase('employee', employeeId, () => sounds.coin()), [doPurchase])

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
    const loadedCompany = { ...savedState.company, lastQuarterReport: null }
    dispatch({
      type: 'LOAD_GAME',
      state: {
        ...initialGameState,
        phase: 'game',
        company: loadedCompany,
        history: savedState.history || [loadedCompany],
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
    <GameContext.Provider value={{ state, dispatch, saveGame, decide, buyTech, expandMarket, hireEmployee, loadGames, loadGame, deleteGame, newGame }}>
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