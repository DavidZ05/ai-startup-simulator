import { useState } from 'react'
import { INDUSTRIES, INITIAL_COMPANY } from '../game/decisions.js'

export default function CreateCompany({ onStart }) {
  const [company, setCompany] = useState({
    name: '',
    industry: '',
    funds: INITIAL_COMPANY.funds,
    targetUsers: '',
  })

  const [step, setStep] = useState(1)

  const canProceed = step === 1
    ? company.name.length >= 2
    : step === 2
    ? company.industry !== ''
    : company.targetUsers.length >= 2

  const handleStart = () => {
    const selectedIndustry = INDUSTRIES.find(i => i.id === company.industry)
    onStart({
      ...INITIAL_COMPANY,
      name: company.name,
      industry: selectedIndustry.name,
      targetUsers: company.targetUsers,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            AI Startup Simulator
          </h1>
          <p className="text-lg text-slate-400">Build the next unicorn from scratch</p>
        </div>

        <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 rounded transition-all duration-300 ${
                    step > s ? 'bg-indigo-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Startup Name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="e.g. NeuralFlow, QuantumAI..."
                  className="w-full px-4 py-3 bg-[#12122a] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500 mt-1">{company.name.length}/30 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Customers</label>
                <input
                  type="text"
                  value={company.targetUsers}
                  onChange={(e) => setCompany({ ...company, targetUsers: e.target.value })}
                  placeholder="e.g. Small businesses, Students, Enterprise..."
                  className="w-full px-4 py-3 bg-[#12122a] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-300 mb-4">Select Industry</label>
              <div className="grid grid-cols-2 gap-3">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setCompany({ ...company, industry: ind.id })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                      company.industry === ind.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-600 bg-[#12122a] hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{ind.emoji}</div>
                    <div className="font-semibold text-white">{ind.name}</div>
                    <div className="text-xs text-slate-400">{ind.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-300 mb-4">Initial Funding</label>
              <div className="bg-[#12122a] rounded-xl p-6 border border-slate-600">
                <div className="text-center mb-6">
                  <div className="text-5xl font-black text-emerald-400 mb-2">
                    ${INITIAL_COMPANY.funds.toLocaleString()}
                  </div>
                  <p className="text-slate-400">Seed Capital</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400">Monthly Burn</div>
                    <div className="text-white font-semibold">~$20,000</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400">Runway</div>
                    <div className="text-white font-semibold">~5 months</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400">Team Size</div>
                    <div className="text-white font-semibold">3 people</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400">Initial Users</div>
                    <div className="text-white font-semibold">10 beta users</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
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
                className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:shadow-none"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 glow-border"
              >
                🚀 Launch Startup
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Each round = 1 month · 3 decisions per month · Don't run out of money!
        </p>
      </div>
    </div>
  )
}