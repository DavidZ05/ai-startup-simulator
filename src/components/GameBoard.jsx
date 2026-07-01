import { useState, useEffect } from 'react'
import Dashboard from './Dashboard.jsx'
import DecisionPanel from './DecisionPanel.jsx'
import MonthlyReport from './MonthlyReport.jsx'
import EventNotification from './EventNotification.jsx'
import { processMonth } from '../game/engine.js'

export default function GameBoard({ initialCompany, onEnd }) {
  const [company, setCompany] = useState(initialCompany)
  const [report, setReport] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [history, setHistory] = useState([initialCompany])
  const [processing, setProcessing] = useState(false)
  const [turn, setTurn] = useState(1)

  useEffect(() => {
    if (currentEvent) {
      const timer = setTimeout(() => setCurrentEvent(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [currentEvent])

  const handleDecide = (decisions) => {
    setProcessing(true)

    setTimeout(() => {
      const result = processMonth(company, decisions)

      setCompany(result.state)
      setHistory(prev => [...prev, result.state])

      if (result.events.length > 0) {
        setCurrentEvent(result.events[Math.floor(Math.random() * result.events.length)])
      }

      setReport(result.report)
      setProcessing(false)

      if (result.endCondition) {
        setTimeout(() => {
          onEnd(result.endCondition, result.state, history)
        }, 500)
      }
    }, 800)
  }

  const handleCloseReport = () => {
    setReport(null)
    setTurn(prev => prev + 1)
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthName = monthNames[(company.month - 1) % 12]
  const currentYear = Math.floor((company.month - 1) / 12) + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="bg-[#12122a]/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {company.name}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <span className="px-2 py-1 bg-slate-700/50 rounded-lg">{company.industry}</span>
              <span>·</span>
              <span>{company.targetUsers}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Month</div>
              <div className="text-sm font-bold text-white">{currentMonthName} Y{currentYear}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Round</div>
              <div className="text-sm font-bold text-indigo-400">{turn}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <Dashboard company={company} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <DecisionPanel
              company={company}
              onDecide={handleDecide}
              onEndTurn={handleCloseReport}
              disabled={processing}
            />
          </div>
        </div>
      </div>

      {report && <MonthlyReport report={report} onClose={handleCloseReport} />}
      <EventNotification event={currentEvent} />
    </div>
  )
}