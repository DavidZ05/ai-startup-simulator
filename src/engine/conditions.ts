import type { Company, EndCondition } from '../types/game'
import { VICTORY_THRESHOLDS, DEFEAT_THRESHOLDS, GAME_CONFIG } from '../config/constants'

export function getEndCondition(company: Company): EndCondition | null {
  if (company.funds <= DEFEAT_THRESHOLDS.ZERO_FUNDS) {
    return { type: 'fail', reason: 'Out of funds! Your startup ran out of money.' }
  }

  if (company.teamMorale <= DEFEAT_THRESHOLDS.LOW_MORALE) {
    return { type: 'fail', reason: 'Team morale collapsed. Everyone quit!' }
  }

  if (company.month > GAME_CONFIG.MAX_MONTHS) {
    return { type: 'fail', reason: "Time's up! Your startup failed to achieve product-market fit within 3 years." }
  }

  const { PRODUCT_MARKET_FIT, UNICORN, SERIES_A, SUSTAINABLE } = VICTORY_THRESHOLDS

  if (
    company.product >= PRODUCT_MARKET_FIT.product &&
    company.users >= PRODUCT_MARKET_FIT.users &&
    company.marketHeat >= PRODUCT_MARKET_FIT.heat
  ) {
    return { type: 'success', reason: '🎉 You achieved product-market fit! Your startup is thriving!' }
  }

  if (
    company.revenue >= UNICORN.revenue &&
    company.users >= UNICORN.users &&
    company.marketHeat >= UNICORN.heat
  ) {
    return { type: 'success', reason: '🏆 Unicorn status! Your startup is valued at over $1B!' }
  }

  if (
    company.funds >= SERIES_A.funds &&
    company.product >= SERIES_A.product &&
    company.users >= SERIES_A.users
  ) {
    return { type: 'success', reason: '🌟 Series A complete! Your startup is set for growth!' }
  }

  if (
    company.month >= SUSTAINABLE.month &&
    company.product >= SUSTAINABLE.product &&
    company.users >= SUSTAINABLE.users &&
    company.funds > SUSTAINABLE.funds
  ) {
    return { type: 'success', reason: '✅ Profitable and growing! Your startup is sustainable!' }
  }

  if (company.ipoReady) {
    return { type: 'success', reason: '📈 IPO successful! Your startup is now publicly traded!' }
  }

  return null
}