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
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <h3 className="text-lg font-semibold text-ink">Markets</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-colors duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted">{unlockedMarkets.length}/{MARKETS.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
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
              className="management-row"

            >
              <button type="button" aria-expanded={isSelected} onClick={() => setSelectedMarket(isSelected ? null : market.id)} className="management-trigger">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                    <span className="text-sm origin-center transition-transform duration-200">{market.emoji}</span>
                  </div>
                  <span className="text-sm font-medium text-ink">{market.name}</span>
                </div>
                {isUnlocked ? (
                  <span className="text-xs text-success">✓</span>
                ) : (
                  <span className="text-xs text-muted">${market.cost.toLocaleString()}</span>
                )}
              </div>
              </button>

              {isSelected && !isUnlocked && (
                <div className="mt-2 pt-2 border-t border-rule">
                  <p className="text-xs text-muted mb-2">{market.description}</p>
                  {isAvailable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford && meetsRequirements) onExpand(market.id, market.cost)
                      }}
                      disabled={!canAfford || !meetsRequirements}
                      className={`w-full py-2 text-sm rounded ${
                        canAfford && meetsRequirements
                          ? 'bg-accent text-on-accent'
                          : 'bg-paper text-muted'
                      }`}
                    >
                      {!canAfford ? 'Not enough funds' : !meetsRequirements ? 'Requirements not met' : 'Expand'}
                    </button>
                  ) : (
                    <p className="text-xs text-warning">
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
