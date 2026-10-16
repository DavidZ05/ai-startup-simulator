import type { Company, EndCondition } from '../../types/game'
import { Dashboard } from './Dashboard'

interface EndGameProps {
  company: Company
  result: EndCondition
  history: Company[]
  onRestart: () => void
}

export function EndGame({ company, result, history, onRestart }: EndGameProps) {
  const isSuccess = result.type === 'success'
  return (
    <main className="portfolio-page">
      <header className="workspace-top"><div className="brand"><span className="brand-mark" aria-hidden="true">↗</span> AI Startup Simulator</div><span className="date-chip">Venture review / {company.name}</span></header>
      <div className="portfolio-title"><div className={`eyebrow ${isSuccess ? 'text-success' : 'text-danger'}`}>{isSuccess ? 'Milestone achieved' : 'A chapter closes'}</div><h1>{isSuccess ? 'You built something that matters.' : 'Every founder has a first attempt.'}</h1><p>{result.reason}</p></div>
      <div className="panel-heading"><div><h2>{company.name}</h2><p>{company.industry} · Month {company.month}</p></div><button className="primary" onClick={onRestart}>Build your next company ↗</button></div>
      <Dashboard company={company} />
      {history.length > 0 && <section className="panel"><div className="panel-heading"><div><div className="eyebrow">The journey</div><h2>Your company, month by month.</h2></div><span className="date-chip">{history.length} snapshots</span></div><div className="overflow-x-auto max-h-80"><table className="journey-table"><thead><tr><th>Month</th><th>Capital</th><th>Users</th><th>Product</th><th>Morale</th></tr></thead><tbody>{history.map((entry, i) => <tr key={i}><td>{String(entry.month).padStart(2, '0')}</td><td>${entry.funds.toLocaleString()}</td><td>{entry.users.toLocaleString()}</td><td>{entry.product}%</td><td>{entry.teamMorale}%</td></tr>)}</tbody></table></div></section>}
    </main>
  )
}
