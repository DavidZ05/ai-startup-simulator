import { useGameContext } from '../../context/useGame'
import { INDUSTRIES } from '../../config/decisions'
import { GAME_CONFIG } from '../../config/constants'
import { sounds } from '../../utils/sounds'
import { useState } from 'react'

export function CreateCompany() {
  const { newGame, state } = useGameContext()
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState({
    name: '',
    industry: '',
    targetUsers: '',
  })

  const canProceed = step === 1
    ? company.name.trim().length >= 2 && company.targetUsers.trim().length >= 2
    : step === 2
    ? company.industry !== ''
    : company.targetUsers.trim().length >= 2

  const handleStart = async () => {
    sounds.confirm()
    await newGame({companyName:company.name,industry:company.industry,targetUsers:company.targetUsers})
  }

  return (
    <main className="launch-page">
      <div className="brand"><span className="brand-mark" aria-hidden="true">↗</span> AI Startup Simulator</div>
      <div className="launch-layout">
        <aside><div className="eyebrow">New venture / Getting started</div><h1>Give your idea<br />a place to grow.</h1><p>A name, a market, a first investment. The rest is up to you.</p><div className="launch-steps">{['Your company', 'Your industry', 'Your launch'].map((label, i) => <div key={label} data-active={step === i + 1}><span>{step > i + 1 ? '✓' : `0${i + 1}`}</span>{label}</div>)}</div></aside>
        <section className="panel">
          <div className="panel-heading"><div><div className="eyebrow">Step {step} of 3</div><h2>{step === 1 ? 'Start with the basics.' : step === 2 ? 'Find your playing field.' : 'Ready for day one.'}</h2></div></div>
          {step === 1 && <><div className="field"><label htmlFor="company-name">Company name</label><input id="company-name" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} placeholder="What will you call it?" maxLength={30} /><p className="text-xs text-muted mt-2">At least 2 characters · {company.name.length}/30</p></div><div className="field"><label htmlFor="target-users">Target customers</label><input id="target-users" value={company.targetUsers} onChange={e => setCompany({ ...company, targetUsers: e.target.value })} placeholder="Who are you building for?" maxLength={50} /><p className="text-xs text-muted mt-2">Describe your customers in at least 2 characters.</p></div></>}
          {step === 2 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{INDUSTRIES.map(ind => <button key={ind.id} onClick={() => setCompany({ ...company, industry: ind.id })} aria-pressed={company.industry === ind.id} className="decision-option"><div className="flex justify-between items-center mb-3"><span aria-hidden="true">{ind.emoji}</span><span className="decision-check">{company.industry === ind.id ? '✓' : ''}</span></div><div className="text-sm font-semibold">{ind.name}</div><p className="text-xs text-muted mt-1">{ind.description}</p></button>)}</div>}
          {step === 3 && <><div className="eyebrow">Seed capital</div><div className="text-4xl font-semibold my-4">${GAME_CONFIG.INITIAL_FUNDS.toLocaleString()}</div><p className="text-sm text-muted mb-6">Your first investment in {company.name}.</p><dl className="space-y-4 text-sm">{[
            ['Industry', INDUSTRIES.find(i => i.id === company.industry)?.name || company.industry],
            ['Customers', company.targetUsers],
            ['Monthly burn', `$${(GAME_CONFIG.INITIAL_BURN_RATE * GAME_CONFIG.BURN_COST_MULTIPLIER).toLocaleString()}`],
            ['Starting runway', `${Math.floor(GAME_CONFIG.INITIAL_FUNDS / (GAME_CONFIG.INITIAL_BURN_RATE * GAME_CONFIG.BURN_COST_MULTIPLIER))} months`],
            ['Initial users', `${GAME_CONFIG.INITIAL_USERS}`],
          ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-rule pb-3"><dt className="text-muted">{label}</dt><dd className="font-medium text-right">{value}</dd></div>)}</dl></>}
          {state.error && <p role="alert" className="text-sm text-danger mt-4">{state.error}</p>}
          <div className="launch-footer">{step > 1 ? <button className="secondary" onClick={() => { sounds.click(); setStep(step - 1) }}>← Back</button> : <span />}{step < 3 ? <button className="primary" disabled={!canProceed || state.processing} onClick={() => { sounds.click(); setStep(step + 1) }}>Continue →</button> : <button className="primary" onClick={handleStart} disabled={!canProceed || state.processing}>{state.processing ? 'Creating…' : 'Launch company ↗'}</button>}</div>
          <p className="text-xs text-muted mt-6">1 round = 1 month · {GAME_CONFIG.MAX_DECISIONS_PER_ROUND} decisions per round</p>
        </section>
      </div>
    </main>
  )
}
