import type { Company } from '../../types/game'

const METRICS = [
  { key: 'funds', label: 'Available capital', max: 500000, format: (v: number) => `$${v.toLocaleString()}` },
  { key: 'users', label: 'Active users', max: 1000, format: (v: number) => v.toLocaleString() },
  { key: 'revenue', label: 'Revenue', max: 100, format: (v: number) => `${v}%` },
  { key: 'product', label: 'Product maturity', max: 100, format: (v: number) => `${v}%` },
  { key: 'teamMorale', label: 'Team morale', max: 100, format: (v: number) => `${v}%` },
  { key: 'marketHeat', label: 'Market momentum', max: 100, format: (v: number) => `${v}%` },
  { key: 'competition', label: 'Competitive pressure', max: 100, format: (v: number) => `${v}%` },
] as const

export function Dashboard({ company }: { company: Company }) {
  const runway = Math.floor(company.funds / (company.burnRate * 1500))
  return (
    <section className="metrics" aria-label="Company metrics">
      {METRICS.map(metric => {
        const value = company[metric.key]
        return <div className="metric" key={metric.key}><div className="metric-label">{metric.label}</div><div className="metric-value">{metric.format(value)}</div><div className="metric-track"><span style={{ width: `${Math.max(0, Math.min(100, value / metric.max * 100))}%` }} /></div></div>
      })}
      <div className="metric"><div className="metric-label">Cash runway</div><div className={`metric-value ${runway < 3 ? 'text-danger' : ''}`}>{runway}<span className="text-sm text-muted"> months</span></div><p className="text-xs text-muted mt-2">${(company.burnRate * 1500).toLocaleString()} monthly burn</p></div>
    </section>
  )
}
