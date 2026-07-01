import { useEffect, useRef } from 'react'
import { useGameContext } from '../../context/GameContext'
import { processMonth } from '../../engine/processor'
import { Dashboard } from './Dashboard'
import { DecisionPanel } from './DecisionPanel'
import { MonthlyReport } from './MonthlyReport'
import { EventNotification } from './EventNotification'
import type { Decision } from '../../types/game'

export function GameBoard() {
  const { state, dispatch, saveGame } = useGameContext()
  const { company, currentReport, currentEvent, turn, processing } = state
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (currentEvent) {
      const timer = setTimeout(() => dispatch({ type: 'SET_EVENT', event: null }), 4000)
      return () => clearTimeout(timer)
    }
  }, [currentEvent, dispatch])

  useEffect(() => {
    if (company && !processing) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveGame()
      }, 1000)
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [company, processing, saveGame])

  const handleDecide = (decisions: Decision[]) => {
    if (!company) return

    dispatch({ type: 'PROCESS_MONTH', decisions })

    setTimeout(() => {
      const result = processMonth(company, decisions)
      dispatch({ type: 'MONTH_PROCESSED', result })

      if (result.endCondition) {
        setTimeout(() => {
          dispatch({ type: 'END_GAME', result: result.endCondition!, company: result.state })
        }, 500)
      }
    }, 800)
  }

  const handleCloseReport = () => {
    dispatch({ type: 'CLOSE_REPORT' })
  }

  if (!company) return null

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
              disabled={processing}
            />
          </div>
        </div>
      </div>

      {currentReport && (
        <MonthlyReport report={currentReport.report} onClose={handleCloseReport} />
      )}
      {currentEvent && <EventNotification event={currentEvent} />}
    </div>
  )
}