import type { Company } from '../../types/game'

const METRIC_CONFIG = {
  funds: { label: 'Funds', icon: '💰', color: 'emerald', max: 500000, format: (v: number) => `$${v.toLocaleString()}` },
  users: { label: 'Users', icon: '👥', color: 'blue', max: 1000, format: (v: number) => v.toLocaleString() },
  revenue: { label: 'Revenue', icon: '📈', color: 'purple', max: 100, format: (v: number) => `${v}%` },
  teamMorale: { label: 'Morale', icon: '❤️', color: 'rose', max: 100, format: (v: number) => `${v}%` },
  product: { label: 'Product', icon: '💻', color: 'cyan', max: 100, format: (v: number) => `${v}%` },
  marketHeat: { label: 'Heat', icon: '🔥', color: 'amber', max: 100, format: (v: number) => `${v}%` },
  competition: { label: 'Competition', icon: '⚔️', color: 'red', max: 100, format: (v: number) => `${v}%` },
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

interface DashboardProps {
  company: Company
}

export function Dashboard({ company }: DashboardProps) {
  const runway = Math.floor(company.funds / (company.burnRate * 1500))
  
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-sm font-bold text-white">Dashboard</h2>
        </div>
        <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          runway < 3 ? 'bg-red-500/20 text-red-400' : 
          runway < 6 ? 'bg-amber-500/20 text-amber-400' : 
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {runway}mo runway
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const value = company[key as keyof Company] as number
          const percentage = Math.min((value / config.max) * 100, 100)
          const colors = COLOR_MAP[config.color as keyof typeof COLOR_MAP]

          return (
            <div key={key} className={`p-2 rounded-lg ${colors.bg} border ${colors.border} transition-all duration-300`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-[11px] font-medium text-slate-300">{config.label}</span>
                </div>
                <span className={`text-[11px] font-bold ${colors.text}`}>
                  {config.format(value)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Burn</span>
          <span className="text-slate-300 font-medium">${(company.burnRate * 1500).toLocaleString()}/mo</span>
        </div>
      </div>
    </div>
  )
}