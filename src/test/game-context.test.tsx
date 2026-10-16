import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { GameProvider } from '../context/GameContext'
import { useGameContext } from '../context/useGame'
import { api } from '../services/api'
import type { Company } from '../types/game'

vi.mock('../utils/sounds', () => ({sounds:{confirm:vi.fn(),success:vi.fn(),levelUp:vi.fn(),coin:vi.fn(),achievement:vi.fn()}}))
const company: Company = {name:'Fieldwork',industry:'AI SaaS',targetUsers:'Founders',funds:200000,users:10,revenue:0,teamMorale:70,product:20,marketHeat:5,competition:10,burnRate:8,month:1,maxDecisions:3,fundraisingCount:0,cooldowns:{}}
const snapshot = {company,history:[company],turn:1,revision:0,endCondition:null}
let game: ReturnType<typeof useGameContext>
function Harness() {
  game = useGameContext()
  return <><span data-testid="funds">{game.state.company?.funds}</span><span data-testid="month">{game.state.company?.month}</span><span data-testid="phase">{game.state.phase}</span><span data-testid="error">{game.state.error}</span></>
}
beforeEach(() => {
  vi.spyOn(api,'createGame').mockResolvedValue({id:1,company_name:company.name,industry:company.industry,is_active:1,updated_at:'',state:snapshot})
  render(<GameProvider><Harness /></GameProvider>)
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
async function start() {
  await act(async () => game.newGame({companyName:'Fieldwork',industry:'ai-saas',targetUsers:'Founders'}))
}

describe('Server-owned game state', () => {
  it('uses the canonical state returned by game creation', async () => {
    await start()
    expect(screen.getByTestId('funds')).toHaveTextContent('200000')
  })
  it('does not apply a locally rejected purchase', async () => {
    await start()
    vi.spyOn(api,'purchase').mockRejectedValue(new Error('Requirements not met'))
    await act(async () => game.buyTech('ai-features'))
    expect(game.state.company?.unlockedTech || []).not.toContain('ai-features')
    expect(screen.getByTestId('funds')).toHaveTextContent('200000')
    expect(screen.getByTestId('error')).toHaveTextContent('Requirements not met')
  })
  it('does not advance or reroll a turn when the request fails', async () => {
    await start()
    vi.spyOn(api,'processTurn').mockRejectedValue(new Error('Network unavailable'))
    await act(async () => game.decide([{id:'product-dev'}] as never))
    expect(screen.getByTestId('month')).toHaveTextContent('1')
    expect(game.state.processing).toBe(false)
    expect(screen.getByTestId('error')).toHaveTextContent('Network unavailable')
  })
  it('restores terminal state when loading a completed game', async () => {
    vi.spyOn(api,'getGame').mockResolvedValue({id:1,company_name:company.name,industry:company.industry,is_active:0,updated_at:'',state:{...snapshot,endCondition:{type:'fail',reason:'Out of funds'}}})
    await act(async () => game.loadGame(1))
    expect(screen.getByTestId('phase')).toHaveTextContent('end')
  })
})
