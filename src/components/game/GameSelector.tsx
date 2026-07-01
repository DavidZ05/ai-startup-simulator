import { useState, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useAuth } from '../../context/AuthContext'

interface GameSelectorProps {
  onSelectGame: (gameId: number) => void
  onNewGame: () => void
}

export function GameSelector({ onSelectGame, onNewGame }: GameSelectorProps) {
  const { loadGames, deleteGame } = useGameContext()
  const { user, logout } = useAuth()
  const [games, setGames] = useState<Array<{ id: number; company_name: string; industry: string; updated_at: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames().then(g => {
      setGames(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [loadGames])

  const handleDelete = async (e: React.MouseEvent, gameId: number) => {
    e.stopPropagation()
    if (!confirm('Delete this game?')) return
    await deleteGame(gameId)
    setGames(games.filter(g => g.id !== gameId))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            AI Startup Simulator
          </h1>
          <p className="text-slate-400">Welcome, {user?.username}</p>
        </div>

        <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Your Games</h2>
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No saved games yet</p>
              <button
                onClick={onNewGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 active:scale-[0.98]"
              >
                🚀 Start New Game
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {games.map(game => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="p-4 rounded-xl border border-slate-600/50 bg-[#12122a]/50 hover:border-indigo-500/50 hover:bg-[#1a1a3e] cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {game.company_name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {game.industry} · Saved {new Date(game.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, game.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={onNewGame}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-600/50 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-all duration-200"
              >
                + New Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}