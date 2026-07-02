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
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💼</span>
        <h3 className="text-sm font-bold text-white">Exit Options</h3>
      </div>

      <div className="space-y-3">
        <div className={`p-3 rounded-lg border ${
          ipoReady
            ? 'bg-amber-500/10 border-amber-500/30'
            : meetsIPO
            ? 'bg-indigo-500/10 border-indigo-500/30'
            : 'bg-slate-800/20 border-slate-700/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">📈</span>
              <span className="text-xs font-medium text-white">IPO (Go Public)</span>
            </div>
            {ipoReady ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Ready!</span>
            ) : (
              <span className="text-[10px] text-slate-400">Locked</span>
            )}
          </div>
          
          <div className="text-[10px] text-slate-400 mb-2">
            Requirements: Month ≥ {ipoRequirements.month}, Product ≥ {ipoRequirements.product}%, Users ≥ {ipoRequirements.users}, Funds ≥ ${ipoRequirements.funds.toLocaleString()}
          </div>

          {ipoReady ? (
            <button
              onClick={onGoPublic}
              className="w-full py-2 text-xs rounded bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold transition-all"
            >
              🚀 Launch IPO
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Month</span>
                <span className={company.month >= ipoRequirements.month ? 'text-emerald-400' : 'text-red-400'}>
                  {company.month}/{ipoRequirements.month}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Product</span>
                <span className={company.product >= ipoRequirements.product ? 'text-emerald-400' : 'text-red-400'}>
                  {company.product}%/{ipoRequirements.product}%
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Users</span>
                <span className={company.users >= ipoRequirements.users ? 'text-emerald-400' : 'text-red-400'}>
                  {company.users}/{ipoRequirements.users}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Funds</span>
                <span className={company.funds >= ipoRequirements.funds ? 'text-emerald-400' : 'text-red-400'}>
                  ${company.funds.toLocaleString()}/${ipoRequirements.funds.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {offers.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Acquisition Offers</div>
            <div className="space-y-2">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedOffer === offer.id
                      ? 'bg-indigo-500/15 border-indigo-500/30'
                      : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{offer.company}</span>
                    <span className="text-xs font-bold text-emerald-400">${offer.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{offer.terms}</p>
                  
                  {selectedOffer === offer.id && (
                    <div className="mt-2 pt-2 border-t border-slate-700/30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAcceptOffer(offer.id)
                        }}
                        className="w-full py-2 text-xs rounded bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold transition-all"
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
            <p className="text-xs text-slate-400">Build your company to attract offers</p>
            <p className="text-[10px] text-slate-500 mt-1">Increase product, users, and funds to unlock exit options</p>
          </div>
        )}
      </div>
    </div>
  )
}
