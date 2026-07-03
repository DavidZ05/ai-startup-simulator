import type { QuarterlyReport } from '../../types/game'

interface QuarterlyReportProps {
  report: QuarterlyReport
  onClose: () => void
}

export function QuarterlyReportModal({ report, onClose }: QuarterlyReportProps) {
  const quarter = Math.ceil(report.month / 3)
  const year = Math.floor((report.month - 1) / 12) + 1

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#12122a]/95 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quarterly Report</h3>
              <p className="text-xs text-slate-500">Q{quarter} Year {year} - Month {report.month}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{report.summary}</p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Highlights</h4>
            <div className="space-y-1.5">
              {report.highlights.map((highlight, i) => (
                <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5">
                  <p className="text-[11px] text-slate-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {report.achievements.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recent Achievements</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.achievements.map((achievement, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            Continue to Next Month →
          </button>
        </div>
      </div>
    </div>
  )
}
