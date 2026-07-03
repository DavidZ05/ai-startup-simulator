import { useState, useMemo } from 'react'
import { DECISIONS } from '../../config/decisions'
import { getDecisionCost } from '../../engine/calculator'
import { checkCooldown, checkRequirements } from '../../engine/validator'
import { sounds } from '../../utils/sounds'
import type { Company, Decision } from '../../types/game'

interface DecisionPanelProps {
  company: Company
  onDecide: (decisions: Decision[]) => void
  disabled: boolean
}

export function DecisionPanel({ company, onDecide, disabled }: DecisionPanelProps) {
  const [selected, setSelected] = useState<Decision[]>([])
  const remaining = company.maxDecisions - selected.length

  const decisionsWithStatus = useMemo(() => {
    return DECISIONS.map(d => {
      const cost = getDecisionCost(d, company.funds)
      const canAfford = company.funds >= cost
      const onCooldown = !checkCooldown(d, company)
      const cooldownLeft = onCooldown && d.cooldown && company.cooldowns?.[d.id]
        ? d.cooldown - (company.month - company.cooldowns[d.id])
        : 0
      const meetsRequirements = checkRequirements(d, company)

      let dynamicDisplay = null
      if (d.dynamicEffect) {
        dynamicDisplay = d.dynamicEffect(company)
      }

      return {
        ...d,
        cost,
        canAfford,
        onCooldown,
        cooldownLeft,
        meetsRequirements,
        dynamicDisplay,
      }
    })
  }, [company])

  const toggleDecision = (decision: typeof decisionsWithStatus[0]) => {
    if (disabled) return
    if (!decision.canAfford || decision.onCooldown || !decision.meetsRequirements) return

    sounds.select()

    if (selected.find(s => s.id === decision.id)) {
      setSelected(selected.filter(s => s.id !== decision.id))
    } else if (remaining > 0) {
      setSelected([...selected, decision])
    }
  }

  const handleConfirm = () => {
    sounds.confirm()
    onDecide(selected)
    setSelected([])
  }

  const categories = {
    core: { label: 'Core' },
    growth: { label: 'Growth' },
    team: { label: 'Team' },
    finance: { label: 'Finance' },
  }

  return (
    <div className="bg-[#12122a]/90 backdrop-blur-2xl rounded-2xl border border-white/5 p-5 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm">⚡</span>
          </div>
          <h2 className="text-base font-bold text-white">Decisions</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          remaining === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
        }`}>
          {remaining} left
        </div>
      </div>

      <div className="space-y-1.5">
        {Object.entries(categories).map(([catKey, cat]) => (
          <div key={catKey}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-3">
              {cat.label}
            </div>
            {decisionsWithStatus.filter(d => d.category === catKey).map(decision => {
              const isSelected = selected.find(s => s.id === decision.id)
              const isDisabled = disabled || (!isSelected && remaining === 0)
              const blocked = !decision.canAfford || decision.onCooldown || !decision.meetsRequirements

              return (
                <button
                  key={decision.id}
                  onClick={() => toggleDecision(decision)}
                  disabled={isDisabled || (blocked && !isSelected)}
                  className={`w-full text-left p-3 rounded-xl mb-1.5 border transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-500/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shadow-lg shadow-indigo-500/10'
                      : !blocked && !isDisabled
                      ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                      : 'border-white/5 bg-white/[0.01] opacity-30 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{decision.emoji}</span>
                        <span className="font-semibold text-white text-xs">{decision.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{decision.description}</p>

                      {decision.onCooldown && (
                        <div className="mt-1.5 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
                          ⏱️ {decision.cooldownLeft}mo cooldown
                        </div>
                      )}
                      {!decision.meetsRequirements && (
                        <div className="mt-1.5 text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 inline-block">
                          🔒 Locked
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {decision.dynamicDisplay ? (
                          Object.entries(decision.dynamicDisplay).map(([key, val]) => (
                            <span key={key} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              +${(val as number).toLocaleString()}
                            </span>
                          ))
                        ) : (
                          Object.entries(decision.effects).slice(0, 3).map(([key, val]) => (
                            <span key={key} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                              (val as number) > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {(val as number) > 0 ? '+' : ''}{val} {key.slice(0, 3)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className={`text-xs font-bold whitespace-nowrap ${decision.canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${decision.cost.toLocaleString()}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={selected.length === 0 || disabled}
        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-600 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:shadow-none active:scale-[0.98]"
      >
        {disabled ? 'Processing...' : selected.length === 0 ? 'Select decisions above' : `Confirm ${selected.length} Decision${selected.length > 1 ? 's' : ''}`}
      </button>
    </div>
  )
}