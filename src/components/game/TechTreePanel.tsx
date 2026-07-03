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
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <h3 className="text-sm font-bold text-white">Tech Tree</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{unlocked.length}/{TECH_TREE.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {TECH_TREE.map(tech => {
          const isUnlocked = unlocked.includes(tech.id)
          const isAvailable = available.some(a => a.id === tech.id)
          const isSelected = selectedTech === tech.id
          const canAfford = company.funds >= tech.cost

          return (
            <div
              key={tech.id}
              onClick={() => setSelectedTech(isSelected ? null : tech.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                isUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isAvailable && canAfford
                  ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                  : isAvailable
                  ? 'bg-slate-800/30 border-slate-600/30 opacity-60'
                  : 'bg-slate-800/20 border-slate-700/20 opacity-30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm origin-center group-hover:scale-125 transition-transform duration-200">{tech.emoji}</span>
                  <span className="text-[11px] font-medium text-white">{tech.name}</span>
                </div>
                {isUnlocked ? (
                  <span className="text-[10px] text-emerald-400">✓</span>
                ) : (
                  <span className="text-[10px] text-slate-400">${tech.cost.toLocaleString()}</span>
                )}
              </div>

              {isSelected && !isUnlocked && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <p className="text-[10px] text-slate-400 mb-2">{tech.description}</p>
                  {isAvailable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford) onUnlock(tech.id, tech.cost)
                      }}
                      disabled={!canAfford}
                      className={`w-full py-1 text-[10px] rounded transition-all ${
                        canAfford
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {canAfford ? 'Unlock' : 'Not enough funds'}
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-400">
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