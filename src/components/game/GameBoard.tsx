import { useEffect, useRef, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { sounds } from '../../utils/sounds'
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
  const { state, dispatch, saveGame, decide, buyTech, expandMarket, hireEmployee } = useGameContext()
  const { company, currentReport, currentEvent, turn, processing } = state
  const [quarterlyReport, setQuarterlyReport] = useState<QuarterlyReport | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (currentEvent) {
      sounds.event()
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
    decide(decisions)
  }

  const handleUnlockTech = (techId: string) => {
    if (!company) return
    buyTech(techId)
  }

  const handleExpandMarket = (marketId: string) => {
    if (!company) return
    expandMarket(marketId)
  }

  const handleHireEmployee = (employeeId: string) => {
    if (!company) return
    hireEmployee(employeeId)
  }

  const handleGoPublic = () => {
    if (!company || !company.ipoReady) return
    sounds.success()
    dispatch({ type: 'END_GAME', result: { type: 'success', reason: '📈 IPO successful! Your startup is now publicly traded!' }, company })
  }

  const handleAcceptOffer = (offerId: string) => {
    if (!company) return
    const offer = company.acquisitionOffers?.find(o => o.id === offerId)
    if (!offer) return
    
    sounds.achievement()
    const acquiredCompany = {
      ...company,
      funds: company.funds + offer.amount,
    }
    dispatch({ type: 'END_GAME', result: { type: 'success', reason: `🤝 Acquired by ${offer.company} for $${offer.amount.toLocaleString()}!` }, company: acquiredCompany })
  }

  const handleCloseReport = () => {
    if (company?.lastQuarterReport) {
      setQuarterlyReport(company.lastQuarterReport)
    }
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
    <div className="workbench">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">↗</span><span>Startup<br />Simulator</span></div>
        <nav aria-label="Company navigation">
          {[
            ['overview', '01', 'Overview'], ['decisions', '02', 'Decisions'],
            ['technology', '03', 'Technology'], ['markets', '04', 'Markets'],
            ['team', '05', 'Team'], ['milestones', '06', 'Milestones'], ['exit', '07', 'Exit strategy'],
          ].map(([id, number, label]) => <a href={`#${id}`} key={id}><span>{number}</span>{label}</a>)}
        </nav>
        <div className="sidebar-bottom"><p>{company.name}</p><p>{company.industry}</p><p className="mt-4">One month. One move forward.</p></div>
      </aside>
      <main className="workspace" id="overview">
        <header className="workspace-top"><div className="eyebrow">Company / {company.name}</div><span className="date-chip">{currentMonthName} · Year {currentYear} / Round {turn}</span></header>
        <div className="workspace-intro"><div><div className="eyebrow">The founder’s workbench</div><h1>Make your next move.</h1><p>Your company at a glance. Put your resources where they matter.</p></div><span className="date-chip">{marketCount} markets · {employeeCount} hires · {techCount} technologies</span></div>
        <GameErrorBoundary name="Dashboard"><Dashboard company={company} /></GameErrorBoundary>
        <div className="operation-grid">
          <section className="section-anchor" id="decisions"><GameErrorBoundary name="DecisionPanel"><DecisionPanel company={company} onDecide={handleDecide} disabled={processing} /></GameErrorBoundary></section>
          <div className="operation-aside">
            <section className="section-anchor" id="milestones"><GameErrorBoundary name="Achievements"><AchievementsPanel company={company} /></GameErrorBoundary></section>
            <section className="section-anchor" id="exit"><GameErrorBoundary name="IPO"><IPOPanel company={company} onAcceptOffer={handleAcceptOffer} onGoPublic={handleGoPublic} /></GameErrorBoundary></section>
          </div>
        </div>
        <div className="management-grid">
          <section className="section-anchor" id="technology"><GameErrorBoundary name="TechTree"><TechTreePanel company={company} onUnlock={handleUnlockTech} /></GameErrorBoundary></section>
          <section className="section-anchor" id="markets"><GameErrorBoundary name="Markets"><MarketPanel company={company} onExpand={handleExpandMarket} /></GameErrorBoundary></section>
          <section className="section-anchor" id="team"><GameErrorBoundary name="Employees"><EmployeePanel company={company} onHire={handleHireEmployee} /></GameErrorBoundary></section>
        </div>
      </main>

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