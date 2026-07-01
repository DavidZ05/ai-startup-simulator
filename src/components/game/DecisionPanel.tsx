import { useState, useMemo } from 'react'
import { DECISIONS } from '../../config/decisions'
import { getDecisionCost } from '../../engine/calculator'
import { checkCooldown, checkRequirements } from '../../engine/validator'
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

    if (selected.find(s => s.id === decision.id)) {
      setSelected(selected.filter(s => s.id !== decision.id))
    } else if (remaining > 0) {
      setSelected([...selected, decision])
    }
  }

  const handleConfirm = () => {
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
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h2 className="text-lg font-bold text-white">Decisions</h2>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          remaining === 0 ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {remaining} remaining
        </span>
      </div>

      <div className="space-y-2">
        {Object.entries(categories).map(([catKey, cat]) => (
          <div key={catKey}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-3">
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
                  className={`w-full text-left p-3 rounded-xl mb-2 border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                      : !blocked && !isDisabled
                      ? 'border-slate-600/50 bg-[#12122a]/50 hover:border-slate-500 hover:bg-[#1a1a3e]'
                      : 'border-slate-700/30 bg-[#12122a]/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{decision.emoji}</span>
                        <span className="font-semibold text-white text-sm">{decision.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{decision.description}</p>

                      {decision.onCooldown && (
                        <div className="mt-2 text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 inline-block">
                          Cooldown: {decision.cooldownLeft} month(s) left
                        </div>
                      )}
                      {!decision.meetsRequirements && (
                        <div className="mt-2 text-[10px] px-2 py-1 rounded-full bg-red-500/15 text-red-400 inline-block">
                          Requires: {Object.entries(decision.require || {}).map(([k, v]) => `${k} ≥ ${v}`).join(', ')}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {decision.dynamicDisplay ? (
                          Object.entries(decision.dynamicDisplay).map(([key, val]) => (
                            <span key={key} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400">
                              +${(val as number).toLocaleString()} {key}
                            </span>
                          ))
                        ) : (
                          Object.entries(decision.effects).map(([key, val]) => (
                            <span key={key} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              (val as number) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            }`}>
                              {(val as number) > 0 ? '+' : ''}{val} {key}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className={`text-sm font-bold whitespace-nowrap ${decision.canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
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
        className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
      >
        {disabled ? 'Turn Processing...' : selected.length === 0 ? 'Select decisions above' : `Confirm ${selected.length} Decision${selected.length > 1 ? 's' : ''}`}
      </button>
    </div>
  )
}