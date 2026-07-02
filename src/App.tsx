import { useState } from 'react'
import { GameProvider, useGameContext } from './context/GameContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { OfflineIndicator } from './components/ui/OfflineIndicator'
import { LoginForm } from './components/auth/LoginForm'
import { GameSelector } from './components/game/GameSelector'
import { CreateCompany } from './components/game/CreateCompany'
import { GameBoard } from './components/game/GameBoard'
import { EndGame } from './components/game/EndGame'

function GameContent() {
  const { state, dispatch } = useGameContext()

  if (state.phase === 'create') {
    return <CreateCompany />
  }

  if (state.phase === 'end' && state.endResult && state.endCompany) {
    return (
      <EndGame
        company={state.endCompany}
        result={state.endResult}
        history={state.history}
        onRestart={() => dispatch({ type: 'RESTART' })}
      />
    )
  }

  return <GameBoard />
}

function AuthenticatedApp() {
  const { loadGame } = useGameContext()
  const [view, setView] = useState<'selector' | 'game'>('selector')

  const handleSelectGame = async (gameId: number) => {
    await loadGame(gameId)
    setView('game')
  }

  const handleNewGame = () => {
    setView('game')
  }

  if (view === 'selector') {
    return (
      <GameSelector
        onSelectGame={handleSelectGame}
        onNewGame={handleNewGame}
      />
    )
  }

  return <GameContent />
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🚀</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <GameProvider>
      <AuthenticatedApp />
    </GameProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OfflineIndicator />
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}