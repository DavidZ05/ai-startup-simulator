import type { Company, EndCondition } from '../../types/game'

interface EndGameProps {
  company: Company
  result: EndCondition
  history: Company[]
  onRestart: () => void
}

export function EndGame({ company, result, history, onRestart }: EndGameProps) {
  const isSuccess = result.type === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{isSuccess ? '🏆' : '💔'}</div>
          <h1 className={`text-4xl md:text-5xl font-black mb-3 ${
            isSuccess
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent'
          }`}>
            {isSuccess ? 'SUCCESS!' : 'GAME OVER'}
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto">{result.reason}</p>
        </div>

        <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">{company.name}</h2>
              <p className="text-slate-400">{company.industry} · {history.length} months</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-bold text-white">${company.funds.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Final Funds</div>
              </div>
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-lg font-bold text-white">{company.users.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Users</div>
              </div>
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-lg font-bold text-white">{company.revenue}%</div>
                <div className="text-xs text-slate-400">Revenue</div>
              </div>
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">💻</div>
                <div className="text-lg font-bold text-white">{company.product}%</div>
                <div className="text-xs text-slate-400">Product</div>
              </div>
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-lg font-bold text-white">{company.marketHeat}%</div>
                <div className="text-xs text-slate-400">Market Heat</div>
              </div>
              <div className="bg-[#12122a] rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">❤️</div>
                <div className="text-lg font-bold text-white">{company.teamMorale}%</div>
                <div className="text-xs text-slate-400">Morale</div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Journey Timeline</h3>
                <div className="bg-[#12122a] rounded-xl p-4 max-h-48 overflow-y-auto">
                  <table className="w-full">
                    <tbody>
                      {history.map((entry, i) => {
                        const pct = Math.min((entry.funds / 500000) * 100, 100)
                        const isLast = i === history.length - 1
                        return (
                          <tr key={i} className={`border-b border-slate-700/30 last:border-0 ${isLast ? 'bg-indigo-500/5' : ''}`}>
                            <td className="py-2 pr-3 text-xs font-mono text-slate-500 w-10">M{i + 1}</td>
                            <td className="py-2 px-3 w-2/5">
                              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-2 pl-3 text-xs font-mono text-slate-300 text-right w-20">
                              ${entry.funds.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onRestart}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.98]"
            >
              🔄 Start New Company
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}