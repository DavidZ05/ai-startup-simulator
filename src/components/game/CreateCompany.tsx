import { useGameContext } from '../../context/GameContext'
import { INDUSTRIES } from '../../config/decisions'
import { GAME_CONFIG } from '../../config/constants'
import type { Company } from '../../types/game'
import { useState } from 'react'

export function CreateCompany() {
  const { newGame } = useGameContext()
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState({
    name: '',
    industry: '',
    targetUsers: '',
  })

  const canProceed = step === 1
    ? company.name.length >= 2
    : step === 2
    ? company.industry !== ''
    : company.targetUsers.length >= 2

  const handleStart = async () => {
    const selectedIndustry = INDUSTRIES.find(i => i.id === company.industry)
    const newCompany: Company = {
      name: company.name,
      industry: selectedIndustry?.name || company.industry,
      targetUsers: company.targetUsers,
      funds: GAME_CONFIG.INITIAL_FUNDS,
      users: GAME_CONFIG.INITIAL_USERS,
      revenue: 0,
      teamMorale: GAME_CONFIG.INITIAL_MORALE,
      product: GAME_CONFIG.INITIAL_PRODUCT,
      marketHeat: GAME_CONFIG.INITIAL_HEAT,
      competition: GAME_CONFIG.INITIAL_COMPETITION,
      burnRate: GAME_CONFIG.INITIAL_BURN_RATE,
      month: 1,
      maxDecisions: GAME_CONFIG.MAX_DECISIONS_PER_ROUND,
      fundraisingCount: 0,
      cooldowns: {},
    }
    await newGame(newCompany)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a1a] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-2">
            AI Startup Simulator
          </h1>
          <p className="text-slate-400 text-sm">Build the next unicorn from scratch</p>
        </div>

        <div className="bg-[#12122a]/90 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  step >= s
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}>
                  {step > s ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                  {step === s && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20" />
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 rounded transition-all duration-500 ${
                    step > s ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Startup Name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="NeuralFlow, QuantumAI..."
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-base"
                  maxLength={30}
                />
                <p className="text-[10px] text-slate-600 mt-1.5 text-right">{company.name.length}/30</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Customers</label>
                <input
                  type="text"
                  value={company.targetUsers}
                  onChange={(e) => setCompany({ ...company, targetUsers: e.target.value })}
                  placeholder="Small businesses, Students..."
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-base"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Industry</label>
              <div className="grid grid-cols-2 gap-2.5">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setCompany({ ...company, industry: ind.id })}
                    className={`p-3.5 rounded-xl border transition-all duration-300 text-left group ${
                      company.industry === ind.id
                        ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1.5 transition-transform duration-200">{ind.emoji}</div>
                    <div className="font-semibold text-white text-sm">{ind.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ind.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Initial Funding</label>
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-5 border border-emerald-500/20">
                <div className="text-center mb-5">
                  <div className="text-4xl font-black text-emerald-400 mb-1">
                    ${GAME_CONFIG.INITIAL_FUNDS.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-400/60">Seed Capital</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Monthly Burn', value: '~$12,000', icon: '🔥' },
                    { label: 'Runway', value: '~16 months', icon: '⏱️' },
                    { label: 'Team Size', value: '3 people', icon: '👥' },
                    { label: 'Initial Users', value: '10 beta', icon: '🎯' },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/20 rounded-xl p-3 text-center">
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className="text-[10px] text-slate-500">{item.label}</div>
                      <div className="text-xs font-semibold text-white mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all duration-200 active:scale-[0.98]"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:shadow-none active:scale-[0.98]"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.98]"
              >
                🚀 Launch Startup
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          1 round = 1 month · 3 decisions per month
        </p>
      </div>
    </div>
  )
}
