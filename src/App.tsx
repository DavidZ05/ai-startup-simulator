import { useGameContext } from './context/GameContext'
import { GameProvider } from './context/GameContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { LoginForm } from './components/auth/LoginForm'
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
      <GameContent />
    </GameProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}