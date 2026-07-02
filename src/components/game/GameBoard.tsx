import { useEffect, useRef, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { processMonth } from '../../engine/processor'
import { Dashboard } from './Dashboard'
import { DecisionPanel } from './DecisionPanel'
import { MonthlyReport } from './MonthlyReport'
import { EventNotification } from './EventNotification'
import { AchievementsPanel } from './AchievementsPanel'
import { TechTreePanel } from './TechTreePanel'
import { MarketPanel } from './MarketPanel'
import { EmployeePanel } from './EmployeePanel'
import { IPOPanel } from './IPOPanel'
import { QuarterlyReportModal } from './QuarterlyReportModal'
import { GameBoardSkeleton } from '../ui/Skeleton'
import { GameErrorBoundary } from '../ui/GameErrorBoundary'
import type { Decision, QuarterlyReport } from '../../types/game'

export function GameBoard() {
  const { state, dispatch, saveGame } = useGameContext()
  const { company, currentReport, currentEvent, turn, processing } = state
  const [quarterlyReport, setQuarterlyReport] = useState<QuarterlyReport | null>(null)
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
      const result = processMonth(company, decisions, state.history)
      dispatch({ type: 'MONTH_PROCESSED', result })

      if (result.state.lastQuarterReport !== null && result.state.lastQuarterReport !== undefined) {
        setTimeout(() => {
          setQuarterlyReport(result.state.lastQuarterReport!)
        }, 1200)
      }

      if (result.endCondition) {
        setTimeout(() => {
          dispatch({ type: 'END_GAME', result: result.endCondition!, company: result.state })
        }, 500)
      }
    }, 800)
  }

  const handleUnlockTech = (techId: string, cost: number) => {
    if (!company || company.funds < cost) return

    import('../../engine/calculator').then(({ applyEffects }) => {
      import('../../config/techTree').then(({ TECH_TREE }) => {
        const tech = TECH_TREE.find(t => t.id === techId)
        if (!tech) return

        const newState = {
          ...company,
          funds: company.funds - cost,
          unlockedTech: [...(company.unlockedTech || []), techId],
        }

        const updatedCompany = applyEffects(newState, tech.effects)
        dispatch({ type: 'LOAD_GAME', state: { ...state, company: updatedCompany } })
      })
    })
  }

  const handleExpandMarket = (marketId: string, cost: number) => {
    if (!company || company.funds < cost) return

    import('../../engine/calculator').then(({ applyEffects }) => {
      import('../../config/markets').then(({ MARKETS }) => {
        const market = MARKETS.find(m => m.id === marketId)
        if (!market) return

        const newState = {
          ...company,
          funds: company.funds - cost,
          unlockedMarkets: [...(company.unlockedMarkets || []), marketId],
        }

        const updatedCompany = applyEffects(newState, market.effects)
        dispatch({ type: 'LOAD_GAME', state: { ...state, company: updatedCompany } })
      })
    })
  }

  const handleHireEmployee = (employeeId: string, cost: number) => {
    if (!company || company.funds < cost) return

    import('../../engine/calculator').then(({ applyEffects }) => {
      import('../../config/employees').then(({ EMPLOYEE_ROLES }) => {
        const employee = EMPLOYEE_ROLES.find(e => e.id === employeeId)
        if (!employee) return

        const newState = {
          ...company,
          funds: company.funds - cost,
          employees: [...(company.employees || []), employeeId],
        }

        const updatedCompany = applyEffects(newState, employee.effects)
        dispatch({ type: 'LOAD_GAME', state: { ...state, company: updatedCompany } })
      })
    })
  }

  const handleGoPublic = () => {
    if (!company || !company.ipoReady) return
    dispatch({ type: 'END_GAME', result: { type: 'success', reason: '📈 IPO successful! Your startup is now publicly traded!' }, company })
  }

  const handleAcceptOffer = (offerId: string) => {
    if (!company) return
    const offer = company.acquisitionOffers?.find(o => o.id === offerId)
    if (!offer) return
    
    const acquiredCompany = {
      ...company,
      funds: company.funds + offer.amount,
    }
    dispatch({ type: 'END_GAME', result: { type: 'success', reason: `🤝 Acquired by ${offer.company} for $${offer.amount.toLocaleString()}!` }, company: acquiredCompany })
  }

  const handleCloseReport = () => {
    dispatch({ type: 'CLOSE_REPORT' })
  }

  const handleCloseQuarterlyReport = () => {
    setQuarterlyReport(null)
  }

  if (!company) {
    return <GameBoardSkeleton />
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthName = monthNames[(company.month - 1) % 12]
  const currentYear = Math.floor((company.month - 1) / 12) + 1

  const marketCount = company.unlockedMarkets?.length || 1
  const employeeCount = company.employees?.length || 0
  const techCount = company.unlockedTech?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="bg-[#12122a]/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {company.name}
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-700/50 rounded-lg">{company.industry}</span>
              <span className="px-2 py-1 bg-slate-700/50 rounded-lg">🌍 {marketCount}</span>
              <span className="px-2 py-1 bg-slate-700/50 rounded-lg">👥 {employeeCount}</span>
              <span className="px-2 py-1 bg-slate-700/50 rounded-lg">🌳 {techCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Month</div>
              <div className="text-sm font-bold text-white">{currentMonthName} Y{currentYear}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Round</div>
              <div className="text-sm font-bold text-indigo-400">{turn}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <GameErrorBoundary name="Dashboard">
              <Dashboard company={company} />
            </GameErrorBoundary>
            <GameErrorBoundary name="Achievements">
              <AchievementsPanel company={company} />
            </GameErrorBoundary>
            <GameErrorBoundary name="Markets">
              <MarketPanel company={company} onExpand={handleExpandMarket} />
            </GameErrorBoundary>
          </div>
          <div className="lg:col-span-6">
            <GameErrorBoundary name="DecisionPanel">
              <DecisionPanel
                company={company}
                onDecide={handleDecide}
                disabled={processing}
              />
            </GameErrorBoundary>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <GameErrorBoundary name="TechTree">
              <TechTreePanel company={company} onUnlock={handleUnlockTech} />
            </GameErrorBoundary>
            <GameErrorBoundary name="Employees">
              <EmployeePanel company={company} onHire={handleHireEmployee} />
            </GameErrorBoundary>
            <GameErrorBoundary name="IPO">
              <IPOPanel company={company} onAcceptOffer={handleAcceptOffer} onGoPublic={handleGoPublic} />
            </GameErrorBoundary>
          </div>
        </div>
      </div>

      {currentReport && !quarterlyReport && (
        <GameErrorBoundary name="MonthlyReport">
          <MonthlyReport report={currentReport.report} onClose={handleCloseReport} />
        </GameErrorBoundary>
      )}
      {quarterlyReport && (
        <GameErrorBoundary name="QuarterlyReport">
          <QuarterlyReportModal report={quarterlyReport} onClose={handleCloseQuarterlyReport} />
        </GameErrorBoundary>
      )}
      {currentEvent && <EventNotification event={currentEvent} />}
    </div>
  )
}