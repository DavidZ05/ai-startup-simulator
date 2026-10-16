import { useState } from 'react'
import type { Company } from '../../types/game'

interface IPOPanelProps {
  company: Company
  onAcceptOffer: (offerId: string) => void
  onGoPublic: () => void
}

export function IPOPanel({ company, onAcceptOffer, onGoPublic }: IPOPanelProps) {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const offers = company.acquisitionOffers || []
  const ipoReady = company.ipoReady || false

  const ipoRequirements = {
    month: 24,
    product: 70,
    users: 100,
    funds: 300000,
  }

  const meetsIPO = company.month >= ipoRequirements.month &&
    company.product >= ipoRequirements.product &&
    company.users >= ipoRequirements.users &&
    company.funds >= ipoRequirements.funds

  return (
    <div className="panel">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💼</span>
        <h3 className="text-lg font-semibold text-ink">Exit Options</h3>
      </div>

      <div className="space-y-3">
        <div className={`p-3 rounded-lg border ${
          ipoReady
            ? 'bg-warning-soft border-warning-soft'
            : meetsIPO
            ? 'bg-accent-soft border-rule'
            : 'bg-paper border-rule'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">📈</span>
              <span className="text-xs font-medium text-ink">IPO (Go Public)</span>
            </div>
            {ipoReady ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning-soft text-warning">Ready!</span>
            ) : (
              <span className="text-xs text-muted">Locked</span>
            )}
          </div>
          
          <div className="text-xs text-muted mb-2">
            Requirements: Month ≥ {ipoRequirements.month}, Product ≥ {ipoRequirements.product}%, Users ≥ {ipoRequirements.users}, Funds ≥ ${ipoRequirements.funds.toLocaleString()}
          </div>

          {ipoReady ? (
            <button
              onClick={onGoPublic}
              className="w-full py-2 text-xs rounded bg-accent text-ink font-semibold transition-colors"
            >
              🚀 Launch IPO
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Month</span>
                <span className={company.month >= ipoRequirements.month ? 'text-success' : 'text-danger'}>
                  {company.month}/{ipoRequirements.month}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Product</span>
                <span className={company.product >= ipoRequirements.product ? 'text-success' : 'text-danger'}>
                  {company.product}%/{ipoRequirements.product}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Users</span>
                <span className={company.users >= ipoRequirements.users ? 'text-success' : 'text-danger'}>
                  {company.users}/{ipoRequirements.users}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Funds</span>
                <span className={company.funds >= ipoRequirements.funds ? 'text-success' : 'text-danger'}>
                  ${company.funds.toLocaleString()}/${ipoRequirements.funds.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {offers.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted mb-2">Acquisition Offers</div>
            <div className="space-y-2">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOffer === offer.id
                      ? 'bg-accent-soft border-rule'
                      : 'bg-paper border-rule hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink">{offer.company}</span>
                    <span className="text-xs font-bold text-success">${offer.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted">{offer.terms}</p>
                  
                  {selectedOffer === offer.id && (
                    <div className="mt-2 pt-2 border-t border-rule">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAcceptOffer(offer.id)
                        }}
                        className="w-full py-2 text-xs rounded bg-accent text-ink font-semibold transition-colors"
                      >
                        Accept Offer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {offers.length === 0 && !ipoReady && (
          <div className="text-center py-4">
            <p className="text-xs text-muted">Build your company to attract offers</p>
            <p className="text-xs text-muted mt-1">Increase product, users, and funds to unlock exit options</p>
          </div>
        )}
      </div>
    </div>
  )
}
