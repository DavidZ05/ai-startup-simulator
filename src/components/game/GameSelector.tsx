import { useState, useEffect, useCallback } from 'react'
import { useGameContext } from '../../context/useGame'
import { useAuth } from '../../context/useAuth'
import { api } from '../../services/api'
import type { GameSummary, StorageStats } from '../../types/api'

interface GameSelectorProps {
  onSelectGame:(gameId:number) => void | Promise<void>
  onNewGame:() => void
}
export function GameSelector({onSelectGame,onNewGame}:GameSelectorProps) {
  const {loadGames,deleteGame} = useGameContext()
  const {user,logout} = useAuth()
  const [games,setGames] = useState<GameSummary[]>([])
  const [loading,setLoading] = useState(true)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState<string|null>(null)
  const [stats,setStats] = useState<StorageStats|null>(null)
  const [confirmAll,setConfirmAll] = useState(false)
  const refresh = useCallback(async () => {
    const [saved,storage] = await Promise.all([loadGames(),api.getStorageStats()])
    setGames(saved)
    setStats(storage)
  },[loadGames])
  useEffect(() => {
    refresh().catch(error => setError(error instanceof Error ? error.message : 'Unable to load companies'))
      .finally(() => setLoading(false))
  },[refresh])
  const run = async (work:() => Promise<void>) => {
    setBusy(true)
    setError(null)
    try { await work() }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to complete this action') }
    finally { setBusy(false) }
  }
  const select = (id:number) => { void run(async () => {await onSelectGame(id)}) }
  const remove = (id:number) => {
    if (!confirm('Permanently delete this company, its history and ranking?')) return
    void run(async () => {await deleteGame(id); await refresh()})
  }
  const cleanup = () => {
    if (!confirm('Permanently remove your inactive companies older than 90 days, including their history and ranking?')) return
    void run(async () => {await api.cleanupStorage(); await refresh()})
  }
  const deleteAll = () => { void run(async () => {
    await api.deleteAllUserData()
    setConfirmAll(false)
    await refresh()
  }) }
  return (
    <main className="portfolio-page">
      <header className="workspace-top"><div className="brand"><span className="brand-mark" aria-hidden="true">↗</span> AI Startup Simulator</div><button onClick={logout} className="secondary">Sign out</button></header>
      <div className="portfolio-title"><div className="eyebrow">Founder portfolio / {user?.username}</div><h1>Your next big idea starts here.</h1><p>Return to a company in progress, or build something new.</p></div>
      {error && <p role="alert" className="panel bg-danger-soft text-danger mb-4">{error}</p>}
      <fieldset disabled={busy} className="game-actions">
        <section className="panel">
          <div className="panel-heading"><div><h2>Your companies</h2><p>{games.length} saved ventures</p></div><button className="primary" onClick={onNewGame}>+ New company</button></div>
          {loading ? <p role="status" className="empty-state text-muted">Loading your companies…</p> : error && !games.length ? <button className="secondary" onClick={() => {void run(refresh)}}>Retry loading companies</button> : !games.length ? (
            <div className="empty-state"><div className="eyebrow">A clean slate</div><h2>Every company starts with an idea.</h2><p>Your first venture is waiting to happen.</p><button className="primary" onClick={onNewGame}>Launch your first company ↗</button></div>
          ) : games.map((game,i) => (
            <div className="saved-game" key={game.id}>
              <span className="saved-game-number">{String(i+1).padStart(2,'0')}</span>
              <button onClick={() => select(game.id)}><h3>{game.company_name}</h3><p>{game.industry} · {game.is_active ? 'In progress' : 'Completed'} · Saved {new Date(game.updated_at).toLocaleDateString()}</p></button>
              <button onClick={() => select(game.id)} className="secondary" aria-label={`Open ${game.company_name}`}>{game.is_active ? 'Continue →' : 'Review →'}</button>
              <button onClick={() => remove(game.id)} className="text-xs text-danger p-2" aria-label={`Delete ${game.company_name}`}>Delete</button>
            </div>
          ))}
        </section>
        <div className="portfolio-tools">
          <div>{stats && <span>{stats.games} games · {stats.totalSize} · <button onClick={cleanup}>Clean up storage</button></span>}</div>
          <span>Cleanup applies only to your inactive companies older than 90 days.</span>
        </div>
        {games.length > 0 && <div className="mt-6 text-xs text-muted">{confirmAll ? (
          <div className="flex flex-wrap items-center gap-4"><span className="text-danger">Permanently delete all your game data?</span><button className="secondary" onClick={() => setConfirmAll(false)}>Cancel</button><button className="secondary text-danger" onClick={deleteAll}>Delete everything</button></div>
        ) : <button onClick={() => setConfirmAll(true)}>Delete all my game data</button>}</div>}
      </fieldset>
    </main>
  )
}
