import type { QuarterlyReport } from '../../types/game'

interface QuarterlyReportProps {
  report: QuarterlyReport
  onClose: () => void
}

export function QuarterlyReportModal({ report, onClose }: QuarterlyReportProps) {
  const quarter = Math.ceil(report.month / 3)
  const year = Math.floor((report.month - 1) / 12) + 1

  return (
    <div role="dialog" aria-modal="true" aria-label="Quarterly report" className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="report-sheet w-full max-w-2xl bg-surface rounded-xl border border-rule overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-rule">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <span aria-hidden="true">↗</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Quarterly review</h3>
              <p className="text-xs text-muted">Q{quarter} Year {year} - Month {report.month}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-paper rounded-xl p-4 border border-rule">
            <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Executive Summary</h4>
            <p className="text-xs text-muted leading-relaxed">{report.summary}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Key Highlights</h4>
            <div className="space-y-1.5">
              {report.highlights.map((highlight, i) => (
                <div key={i} className="bg-accent-soft border border-rule rounded-xl p-2.5">
                  <p className="text-xs text-muted">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {report.achievements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Recent Achievements</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.achievements.map((achievement, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-warning-soft text-warning border border-warning-soft rounded-full">
                    {achievement}
                  </span>
                ))}
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
