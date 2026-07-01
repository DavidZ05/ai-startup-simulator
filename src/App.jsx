import { useState } from 'react'
import CreateCompany from './components/CreateCompany.jsx'
import GameBoard from './components/GameBoard.jsx'
import EndGame from './components/EndGame.jsx'

export default function App() {
  const [screen, setScreen] = useState('create')
  const [company, setCompany] = useState(null)
  const [endResult, setEndResult] = useState(null)
  const [endCompany, setEndCompany] = useState(null)
  const [history, setHistory] = useState([])

  const handleCreate = (newCompany) => {
    setCompany(newCompany)
    setScreen('game')
  }

  const handleEnd = (result, finalCompany, gameHistory) => {
    setEndResult(result)
    setEndCompany(finalCompany)
    setHistory(gameHistory)
    setScreen('end')
  }

  const handleRestart = () => {
    setCompany(null)
    setEndResult(null)
    setEndCompany(null)
    setHistory([])
    setScreen('create')
  }

  if (screen === 'create') {
    return <CreateCompany onStart={handleCreate} />
  }

  if (screen === 'end') {
    return (
      <EndGame
        company={endCompany}
        result={endResult}
        history={history}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <GameBoard
      key={company.name}
      initialCompany={company}
      onEnd={handleEnd}
    />
  )
}