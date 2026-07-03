import type { MonthlyReport as MonthlyReportType } from '../../types/game'

interface MonthlyReportProps {
  report: MonthlyReportType
  onClose: () => void
}

export function MonthlyReport({ report, onClose }: MonthlyReportProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#12122a]/95 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Report</h3>
              <p className="text-xs text-slate-500">{report.period}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {report.decisionSummary && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Decisions</h4>
              <div className="bg-white/[0.02] rounded-xl p-3 text-xs text-slate-300 whitespace-pre-line border border-white/5">
                {report.decisionSummary}
              </div>
            </div>
          )}

          {report.newsSummary && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-[11px] text-amber-400">{report.newsSummary}</p>
            </div>
          )}

          {report.competitorSummary && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-[11px] text-red-400">{report.competitorSummary}</p>
            </div>
          )}

          {report.eventSummary && report.eventSummary !== 'No major events this month.' && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Events</h4>
              <div className="bg-white/[0.02] rounded-xl p-3 text-xs text-slate-300 border border-white/5">
                {report.eventSummary}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Financial', value: report.fundingStatus, color: 'emerald' },
                { label: 'Team', value: report.moraleStatus, color: 'blue' },
                { label: 'Product', value: report.productStatus, color: 'purple' },
                { label: 'Burn Cost', value: `$${report.burnCost.toLocaleString()}`, color: 'amber' },
              ].map((item, i) => (
                <div key={i} className={`bg-${item.color}-500/10 border border-${item.color}-500/20 rounded-xl p-2.5 text-center`}>
                  <div className={`text-[10px] text-${item.color}-400 mb-0.5`}>{item.label}</div>
                  <div className="text-xs font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {report.newAchievements && report.newAchievements.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <h4 className="text-[10px] font-bold text-amber-400 mb-1.5">🎉 New Achievements</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.newAchievements.map((achievement, i) => (
                  <span key={i} className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">{achievement}</span>
                ))}
              </div>
            </div>
          )}

          {report.highlights && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Highlights</h4>
              <div className="bg-white/[0.02] rounded-xl p-3 text-xs text-slate-300 whitespace-pre-line border border-white/5">
                {report.highlights}
              </div>
            </div>
          )}

          {report.insight && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span className="text-sm">💡</span>
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 mb-0.5">AI Insight</div>
                  <p className="text-[11px] text-slate-300">{report.insight}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            Continue to Next Month →
          </button>
        </div>
      </div>
    </div>
  )
}
