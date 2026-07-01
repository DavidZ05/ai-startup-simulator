const METRIC_CONFIG = {
  funds: { label: 'Funds', icon: '💰', color: 'emerald', max: 500000, unit: '$', format: (v) => `$${v.toLocaleString()}` },
  users: { label: 'Users', icon: '👥', color: 'blue', max: 1000, unit: '', format: (v) => v.toLocaleString() },
  revenue: { label: 'Revenue', icon: '📈', color: 'purple', max: 100, unit: '%', format: (v) => `${v}%` },
  teamMorale: { label: 'Team Morale', icon: '❤️', color: 'rose', max: 100, unit: '%', format: (v) => `${v}%` },
  product: { label: 'Product', icon: '💻', color: 'cyan', max: 100, unit: '%', format: (v) => `${v}%` },
  marketHeat: { label: 'Market Heat', icon: '🔥', color: 'amber', max: 100, unit: '%', format: (v) => `${v}%` },
  competition: { label: 'Competition', icon: '⚔️', color: 'red', max: 100, unit: '%', format: (v) => `${v}%` },
}

const COLOR_MAP = {
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  blue: { bar: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  purple: { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  rose: { bar: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  cyan: { bar: 'bg-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  red: { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
}

export default function Dashboard({ company }) {
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">📊</span>
        <h2 className="text-lg font-bold text-white">Company Dashboard</h2>
      </div>

      <div className="space-y-3">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const value = company[key]
          const percentage = Math.min((value / config.max) * 100, 100)
          const colors = COLOR_MAP[config.color]

          return (
            <div key={key} className={`p-3 rounded-xl ${colors.bg} border ${colors.border} transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium text-slate-300">{config.label}</span>
                </div>
                <span className={`text-sm font-bold ${colors.text}`}>
                  {config.format(value)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full progress-bar-fill transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Burn Rate</span>
          <span className="text-slate-300 font-medium">${(company.burnRate * 1500).toLocaleString()}/mo</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-400">Runway</span>
          <span className={`font-medium ${company.funds < 50000 ? 'text-red-400' : company.funds < 100000 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {Math.floor(company.funds / (company.burnRate * 2000))} months
          </span>
        </div>
      </div>
    </div>
  )
}