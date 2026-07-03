import { useState } from 'react'
import type { Company } from '../../types/game'
import { MARKETS, getAvailableMarkets } from '../../config/markets'

interface MarketPanelProps {
  company: Company
  onExpand: (marketId: string, cost: number) => void
}

export function MarketPanel({ company, onExpand }: MarketPanelProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null)
  const unlockedMarkets = company.unlockedMarkets || ['local']
  const available = getAvailableMarkets(unlockedMarkets)
  const progress = Math.round((unlockedMarkets.length / MARKETS.length) * 100)

  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <h3 className="text-sm font-bold text-white">Markets</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{unlockedMarkets.length}/{MARKETS.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {MARKETS.map(market => {
          const isUnlocked = unlockedMarkets.includes(market.id)
          const isAvailable = available.some(a => a.id === market.id)
          const isSelected = selectedMarket === market.id
          const canAfford = company.funds >= market.cost
          const meetsRequirements = !market.unlockRequirement || 
            (!market.unlockRequirement.users || company.users >= market.unlockRequirement.users) &&
            (!market.unlockRequirement.product || company.product >= market.unlockRequirement.product) &&
            (!market.unlockRequirement.funds || company.funds >= market.unlockRequirement.funds)

          return (
            <div
              key={market.id}
              onClick={() => setSelectedMarket(isSelected ? null : market.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-all overflow-hidden ${
                isUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isAvailable && canAfford && meetsRequirements
                  ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                  : isAvailable
                  ? 'bg-slate-800/30 border-slate-600/30 opacity-60'
                  : 'bg-slate-800/20 border-slate-700/20 opacity-30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm group-hover:brightness-125 transition-all duration-200">{market.emoji}</span>
                  <span className="text-xs font-medium text-white">{market.name}</span>
                </div>
                {isUnlocked ? (
                  <span className="text-[10px] text-emerald-400">✓</span>
                ) : (
                  <span className="text-[10px] text-slate-400">${market.cost.toLocaleString()}</span>
                )}
              </div>

              {isSelected && !isUnlocked && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <p className="text-[10px] text-slate-400 mb-2">{market.description}</p>
                  {isAvailable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford && meetsRequirements) onExpand(market.id, market.cost)
                      }}
                      disabled={!canAfford || !meetsRequirements}
                      className={`w-full py-1 text-[10px] rounded ${
                        canAfford && meetsRequirements
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {!canAfford ? 'Not enough funds' : !meetsRequirements ? 'Requirements not met' : 'Expand'}
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-400">
                      Requires: {market.unlockRequirement?.users ? `Users ≥ ${market.unlockRequirement.users}` : ''}
                      {market.unlockRequirement?.product ? `, Product ≥ ${market.unlockRequirement.product}` : ''}
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
