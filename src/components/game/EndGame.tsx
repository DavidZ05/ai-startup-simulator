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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a1a] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {isSuccess ? (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-4 ${
            isSuccess
              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-2xl shadow-amber-500/30'
              : 'bg-gradient-to-br from-red-400 to-pink-500 shadow-2xl shadow-red-500/30'
          }`}>
            <span className="text-5xl">{isSuccess ? '🏆' : '💔'}</span>
          </div>
          <h1 className={`text-4xl font-black mb-2 ${
            isSuccess
              ? 'bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-red-200 via-pink-200 to-red-200 bg-clip-text text-transparent'
          }`}>
            {isSuccess ? 'SUCCESS!' : 'GAME OVER'}
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">{result.reason}</p>
        </div>

        <div className="bg-[#12122a]/90 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-5">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-white">{company.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{company.industry} · {history.length} months</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: '💰', label: 'Funds', value: `$${company.funds.toLocaleString()}`, color: 'emerald' },
                { icon: '👥', label: 'Users', value: company.users.toLocaleString(), color: 'blue' },
                { icon: '📈', label: 'Revenue', value: `${company.revenue}%`, color: 'purple' },
                { icon: '💻', label: 'Product', value: `${company.product}%`, color: 'cyan' },
                { icon: '🔥', label: 'Heat', value: `${company.marketHeat}%`, color: 'amber' },
                { icon: '❤️', label: 'Morale', value: `${company.teamMorale}%`, color: 'rose' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/5">
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-base font-bold text-white">{stat.value}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {history.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Journey Timeline</h3>
                <div className="bg-white/[0.02] rounded-xl p-3 max-h-36 overflow-y-auto border border-white/5">
                  <table className="w-full">
                    <tbody>
                      {history.map((entry, i) => {
                        const pct = Math.min((entry.funds / 500000) * 100, 100)
                        const isLast = i === history.length - 1
                        return (
                          <tr key={i} className={`border-b border-white/5 last:border-0 ${isLast ? 'bg-indigo-500/5' : ''}`}>
                            <td className="py-1.5 pr-2 text-[10px] font-mono text-slate-600 w-8">M{i + 1}</td>
                            <td className="py-1.5 px-2 w-2/5">
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-1.5 pl-2 text-[10px] font-mono text-slate-400 text-right w-16">
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

          <div className="px-5 pb-5 pt-1">
            <button
              onClick={onRestart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.98]"
            >
              🔄 Start New Company
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}