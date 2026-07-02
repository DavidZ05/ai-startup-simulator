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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">
            AI Startup Simulator
          </h1>
          <p className="text-sm text-slate-400">Welcome, {user?.username}</p>
        </div>

        <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Games</h2>
            <button
              onClick={logout}
              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>

          {storageStats && (
            <div className="mb-3 p-2 bg-slate-800/50 rounded-lg flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                {storageStats.games} games · {storageStats.totalSize}
              </span>
              <button
                onClick={handleCleanup}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clean up
              </button>
            </div>
          )}

          <div className="mb-3 p-2.5 bg-slate-800/30 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Auto-cleanup</div>
              <div className="text-[10px] text-slate-400">Delete games older than 90 days</div>
            </div>
            <button
              onClick={() => setAutoCleanup(!autoCleanup)}
              className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                autoCleanup ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                  autoCleanup ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-sm">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-3">No saved games yet</p>
              <button
                onClick={onNewGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 active:scale-[0.98]"
              >
                🚀 Start New Game
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {games.map(game => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="p-3 rounded-xl border border-slate-600/50 bg-[#12122a]/50 hover:border-indigo-500/50 hover:bg-[#1a1a3e] cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {game.company_name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {game.industry} · Saved {new Date(game.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, game.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={onNewGame}
                className="w-full p-3 rounded-xl border-2 border-dashed border-slate-600/50 text-slate-400 text-sm hover:border-indigo-500/50 hover:text-indigo-400 transition-all duration-200"
              >
                + New Game
              </button>
            </div>
          )}

          {games.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              {showDeleteConfirm ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 text-center">This will delete ALL your game data. Are you sure?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 text-[10px] bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAll}
                      className="flex-1 py-1.5 text-[10px] bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors"
                    >
                      Delete Everything
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                >
                  Delete all my data
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}