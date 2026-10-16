import { useState, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

interface GameSelectorProps {
  onSelectGame: (gameId: number) => void
  onNewGame: () => void
}

export function GameSelector({ onSelectGame, onNewGame }: GameSelectorProps) {
  const { loadGames, deleteGame } = useGameContext()
  const { user, logout } = useAuth()
  const [games, setGames] = useState<Array<{ id: number; company_name: string; industry: string; updated_at: string }>>([])
  const [loading, setLoading] = useState(true)
  const [autoCleanup, setAutoCleanup] = useState(() => {
    return localStorage.getItem('auto_cleanup') === 'true'
  })
  const [storageStats, setStorageStats] = useState<{ games: number; totalSize: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadGames().then(g => {
      setGames(g)
      setLoading(false)
    }).catch(() => setLoading(false))

    api.getStorageStats().then(stats => {
      setStorageStats({ games: stats.games, totalSize: stats.database.totalSize })
    }).catch(() => {})
  }, [loadGames])

  useEffect(() => {
    localStorage.setItem('auto_cleanup', String(autoCleanup))
  }, [autoCleanup])

  const handleDelete = async (e: React.MouseEvent, gameId: number) => {
    e.stopPropagation()
    if (!confirm('Delete this game?')) return
    await deleteGame(gameId)
    setGames(games.filter(g => g.id !== gameId))
  }

  const handleDeleteAll = async () => {
    try {
      await api.deleteAllUserData()
      setGames([])
      setShowDeleteConfirm(false)
      alert('All game data deleted')
    } catch {
      alert('Failed to delete data')
    }
  }

  const handleCleanup = async () => {
    try {
      await api.cleanupStorage()
      const stats = await api.getStorageStats()
      setStorageStats({ games: stats.games, totalSize: stats.database.totalSize })
      alert('Storage cleaned up')
    } catch {
      alert('Cleanup failed')
    }
  }

  return (
    <main className="portfolio-page">
      <header className="workspace-top"><div className="brand"><span className="brand-mark" aria-hidden="true">↗</span> AI Startup Simulator</div><button onClick={logout} className="secondary">Sign out</button></header>
      <div className="portfolio-title"><div className="eyebrow">Founder portfolio / {user?.username}</div><h1>Your next big idea starts here.</h1><p>Return to a company in progress, or build something new.</p></div>
      <section className="panel">
        <div className="panel-heading"><div><h2>Your companies</h2><p>{games.length} saved ventures</p></div><button className="primary" onClick={onNewGame}>+ New company</button></div>
        {loading ? <p role="status" className="empty-state text-muted">Loading your companies…</p> : games.length === 0 ? <div className="empty-state"><div className="eyebrow">A clean slate</div><h2>Every company starts with an idea.</h2><p>Your first venture is waiting to happen.</p><button className="primary" onClick={onNewGame}>Launch your first company ↗</button></div> : games.map((game, i) => <div className="saved-game" key={game.id}><span className="saved-game-number">{String(i + 1).padStart(2, '0')}</span><button onClick={() => onSelectGame(game.id)}><h3>{game.company_name}</h3><p>{game.industry} · Saved {new Date(game.updated_at).toLocaleDateString()}</p></button><button onClick={() => onSelectGame(game.id)} className="secondary" aria-label={`Continue ${game.company_name}`}>Continue →</button><button onClick={e => handleDelete(e, game.id)} className="text-xs text-danger p-2" aria-label={`Delete ${game.company_name}`}>Delete</button></div>)}
      </section>
      <div className="portfolio-tools"><div>{storageStats && <span>{storageStats.games} games · {storageStats.totalSize} · <button onClick={handleCleanup}>Clean up storage</button></span>}</div><label className="flex items-center gap-2"><input type="checkbox" checked={autoCleanup} onChange={e => setAutoCleanup(e.target.checked)} />Auto-cleanup preference</label></div>
      {games.length > 0 && <div className="mt-6 text-xs text-muted">{showDeleteConfirm ? <div className="flex flex-wrap items-center gap-4"><span className="text-danger">Permanently delete all your game data?</span><button className="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button><button className="secondary text-danger" onClick={handleDeleteAll}>Delete everything</button></div> : <button onClick={() => setShowDeleteConfirm(true)}>Delete all my game data</button>}</div>}
    </main>
  )
}
