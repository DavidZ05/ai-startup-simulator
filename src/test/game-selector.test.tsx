import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { GameSelector } from '../components/game/GameSelector'

vi.mock('../context/useAuth', () => ({useAuth:() => ({user:{id:1,username:'test'},logout:vi.fn()})}))
vi.mock('../context/useGame', () => ({useGameContext:() => ({loadGames:loadGames,deleteGame:vi.fn()})}))
vi.mock('../services/api', () => ({api:{getStorageStats:vi.fn().mockResolvedValue({games:0,historyEntries:0,totalSize:'0 B'})}}))
const loadGames = vi.fn().mockRejectedValue(new Error('Unable to load saved companies'))
afterEach(cleanup)
it('shows a failed load instead of pretending the user has no saved games', async () => {
  render(<GameSelector onSelectGame={vi.fn()} onNewGame={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load saved companies')
  expect(screen.queryByText('Every company starts with an idea.')).not.toBeInTheDocument()
})
