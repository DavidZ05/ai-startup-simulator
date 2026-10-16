import { useState } from 'react'
import type { Company } from '../../types/game'
import { TECH_TREE, getAvailableTech } from '../../config/techTree'

interface TechTreeProps {
  company: Company
  onUnlock: (techId: string, cost: number) => void
}

export function TechTreePanel({ company, onUnlock }: TechTreeProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const unlocked = company.unlockedTech || []
  const available = getAvailableTech(unlocked)
  const progress = Math.round((unlocked.length / TECH_TREE.length) * 100)

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <h3 className="text-lg font-semibold text-ink">Tech Tree</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-colors duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted">{unlocked.length}/{TECH_TREE.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {TECH_TREE.map(tech => {
          const isUnlocked = unlocked.includes(tech.id)
          const isAvailable = available.some(a => a.id === tech.id)
          const isSelected = selectedTech === tech.id
          const canAfford = company.funds >= tech.cost

          return (
            <div
              key={tech.id}
              className="management-row"

            >
              <button type="button" aria-expanded={isSelected} onClick={() => setSelectedTech(isSelected ? null : tech.id)} className="management-trigger">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                    <span className="text-sm origin-center transition-transform duration-200">{tech.emoji}</span>
                  </div>
                  <span className="text-sm font-medium text-ink">{tech.name}</span>
                </div>
                {isUnlocked ? (
                  <span className="text-xs text-success">✓</span>
                ) : (
                  <span className="text-xs text-muted">${tech.cost.toLocaleString()}</span>
                )}
              </div>
              </button>

              {isSelected && !isUnlocked && (
                <div className="mt-2 pt-2 border-t border-rule">
                  <p className="text-xs text-muted mb-2">{tech.description}</p>
                  {isAvailable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford) onUnlock(tech.id, tech.cost)
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 text-sm rounded transition-colors ${
                        canAfford
                          ? 'bg-accent text-on-accent'
                          : 'bg-paper text-muted'
                      }`}
                    >
                      {canAfford ? 'Unlock' : 'Not enough funds'}
                    </button>
                  ) : (
                    <p className="text-xs text-warning">
                      Requires: {tech.requires.map(r => TECH_TREE.find(t => t.id === r)?.name).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}