import type { MonthlyReport as MonthlyReportType } from '../../types/game'

interface MonthlyReportProps {
  report: MonthlyReportType
  onClose: () => void
}

export function MonthlyReport({ report, onClose }: MonthlyReportProps) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Monthly report" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="report-sheet w-full max-w-2xl bg-surface rounded-xl border border-rule overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-rule">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <span aria-hidden="true">↗</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Monthly review</h3>
              <p className="text-xs text-muted">{report.period}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {report.decisionSummary && (
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Decisions</h4>
              <div className="bg-paper rounded-xl p-3 text-xs text-muted whitespace-pre-line border border-rule">
                {report.decisionSummary}
              </div>
            </div>
          )}

          {report.newsSummary && (
            <div className="bg-warning-soft border border-warning-soft rounded-xl p-3">
              <p className="text-xs text-warning">{report.newsSummary}</p>
            </div>
          )}

          {report.competitorSummary && (
            <div className="bg-danger-soft border border-danger-soft rounded-xl p-3">
              <p className="text-xs text-danger">{report.competitorSummary}</p>
            </div>
          )}

          {report.eventSummary && report.eventSummary !== 'No major events this month.' && (
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Events</h4>
              <div className="bg-paper rounded-xl p-3 text-xs text-muted border border-rule">
                {report.eventSummary}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Financial', value: report.fundingStatus,  },
                { label: 'Team', value: report.moraleStatus,  },
                { label: 'Product', value: report.productStatus,  },
                { label: 'Burn Cost', value: `$${report.burnCost.toLocaleString()}`,  },
              ].map((item, i) => (
                <div key={i} className="bg-paper border border-rule rounded-lg p-3 text-left">
                  <div className="text-xs text-muted mb-1">{item.label}</div>
                  <div className="text-xs font-bold text-ink">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {report.newAchievements && report.newAchievements.length > 0 && (
            <div className="bg-warning-soft border border-warning-soft rounded-xl p-3">
              <h4 className="text-xs font-bold text-warning mb-1.5">🎉 New Achievements</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.newAchievements.map((achievement, i) => (
                  <span key={i} className="text-xs text-warning bg-warning-soft px-2 py-0.5 rounded-full">{achievement}</span>
                ))}
              </div>
            </div>
          )}

          {report.highlights && (
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Highlights</h4>
              <div className="bg-paper rounded-xl p-3 text-xs text-muted whitespace-pre-line border border-rule">
                {report.highlights}
              </div>
            </div>
          )}

          {report.insight && (
            <div className="bg-accent-soft border border-rule rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span className="text-sm">💡</span>
                <div>
                  <div className="text-xs font-bold text-accent mb-0.5">AI Insight</div>
                  <p className="text-xs text-muted">{report.insight}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-accent text-ink font-semibold text-sm transition-colors duration-300"
          >
            Continue to Next Month →
          </button>
        </div>
      </div>
    </div>
  )
}
