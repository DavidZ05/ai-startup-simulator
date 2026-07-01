import type { MonthlyReport as MonthlyReportType } from '../../types/game'

interface MonthlyReportProps {
  report: MonthlyReportType
  onClose: () => void
}

export function MonthlyReport({ report, onClose }: MonthlyReportProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#1e1e3a] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-xl font-bold text-white">Monthly Report</h3>
              <p className="text-sm text-slate-400">{report.period}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {report.decisionSummary && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span>⚡</span> Decisions Made
              </h4>
              <div className="bg-[#12122a] rounded-xl p-3 text-sm text-slate-300 whitespace-pre-line">
                {report.decisionSummary}
              </div>
            </div>
          )}

          {report.eventSummary && report.eventSummary !== 'No major events this month.' && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span>🎲</span> Random Events
              </h4>
              <div className="bg-[#12122a] rounded-xl p-3 text-sm text-slate-300">
                {report.eventSummary}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>📊</span> Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                <div className="text-xs text-emerald-400 mb-1">Financial</div>
                <div className="text-sm font-bold text-white">{report.fundingStatus}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-xs text-blue-400 mb-1">Team</div>
                <div className="text-sm font-bold text-white">{report.moraleStatus}</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <div className="text-xs text-purple-400 mb-1">Product</div>
                <div className="text-sm font-bold text-white">{report.productStatus}</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                <div className="text-xs text-cyan-400 mb-1">Burn Cost</div>
                <div className="text-sm font-bold text-white">${report.burnCost.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {report.highlights && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span>✨</span> Highlights
              </h4>
              <div className="bg-[#12122a] rounded-xl p-3 text-sm text-slate-300 whitespace-pre-line">
                {report.highlights}
              </div>
            </div>
          )}

          {report.insight && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-xs font-semibold text-indigo-400 mb-1">AI Insight</div>
                  <p className="text-sm text-slate-300">{report.insight}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-700/50 bg-[#16163a]/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30"
          >
            Continue to Next Month →
          </button>
        </div>
      </div>
    </div>
  )
}