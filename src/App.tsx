import { useGameContext } from './context/GameContext'
import { GameProvider } from './context/GameContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { CreateCompany } from './components/game/CreateCompany'
import { GameBoard } from './components/game/GameBoard'
import { EndGame } from './components/game/EndGame'

function AppContent() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  )
}