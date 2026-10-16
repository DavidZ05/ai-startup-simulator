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
    <div className="panel">
      <div className="panel-heading"><div><div className="eyebrow">Monthly action plan</div><h2>Decisions</h2><p>Choose up to {company.maxDecisions} moves for your next month.</p></div><span className="date-chip">{selected.length} / {company.maxDecisions}</span></div>

      <div className="decision-categories">
        {Object.entries(categories).map(([catKey, cat]) => (
          <div key={catKey}>
            <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 mt-3">
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
                  aria-pressed={Boolean(isSelected)}
                  className="decision-option"

                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="decision-check" aria-hidden="true">{isSelected ? '✓' : ''}</span>
                        <span className="font-semibold text-ink text-xs">{decision.name}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">{decision.description}</p>

                      {decision.onCooldown && (
                        <div className="mt-1.5 text-xs px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning-soft inline-block">
                          ⏱️ {decision.cooldownLeft}mo cooldown
                        </div>
                      )}
                      {!decision.meetsRequirements && (
                        <div className="mt-1.5 text-xs px-2 py-0.5 rounded-full bg-danger-soft text-danger border border-danger-soft inline-block">
                          🔒 Locked
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {decision.dynamicDisplay ? (
                          Object.entries(decision.dynamicDisplay).map(([key, val]) => (
                            <span key={key} className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-success-soft text-success border border-success-soft">
                              +${(val as number).toLocaleString()}
                            </span>
                          ))
                        ) : (
                          Object.entries(decision.effects).slice(0, 3).map(([key, val]) => (
                            <span key={key} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              (val as number) > 0 ? 'bg-success-soft text-success border border-success-soft' : 'bg-danger-soft text-danger border border-danger-soft'
                            }`}>
                              {(val as number) > 0 ? '+' : ''}{val} {key.slice(0, 3)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className={`text-xs font-bold whitespace-nowrap ${decision.canAfford ? 'text-success' : 'text-danger'}`}>
                      ${decision.cost.toLocaleString()}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="decision-footer"><p>{remaining} decision{remaining === 1 ? '' : 's'} remaining<br />1 round = 1 month</p><button onClick={handleConfirm} disabled={selected.length === 0 || disabled} className="primary">{disabled ? 'Processing…' : selected.length === 0 ? 'Select your decisions' : `Execute ${selected.length} decision${selected.length > 1 ? 's' : ''} →`}</button></div>
    </div>
  )
}
