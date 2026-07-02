import type { QuarterlyReport } from '../../types/game'

interface QuarterlyReportProps {
  report: QuarterlyReport
  onClose: () => void
}

export function QuarterlyReportModal({ report, onClose }: QuarterlyReportProps) {
  const quarter = Math.ceil(report.month / 3)
  const year = Math.floor((report.month - 1) / 12) + 1

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#1e1e3a] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-xl font-bold text-white">Quarterly Report</h3>
              <p className="text-sm text-slate-400">Q{quarter} Year {year} - Month {report.month}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#12122a] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Executive Summary</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>✨</span> Key Highlights
            </h4>
            <div className="space-y-2">
              {report.highlights.map((highlight, i) => (
                <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                  <p className="text-sm text-slate-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {report.achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span>🏆</span> Recent Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.achievements.map((achievement, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-amber-500/15 text-amber-400 rounded-full">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-700/50 bg-[#16163a]/50">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold transition-all duration-200 shadow-lg shadow-amber-500/30 active:scale-[0.98]"
          >
            Continue to Next Month →
          </button>
        </div>
      </div>
    </div>
  )
}
