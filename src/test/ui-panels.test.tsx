import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { GameProvider } from '../context/GameContext'
import { CreateCompany } from '../components/game/CreateCompany'
import { TechTreePanel } from '../components/game/TechTreePanel'
import { MarketPanel } from '../components/game/MarketPanel'
import { EmployeePanel } from '../components/game/EmployeePanel'
import type { Company } from '../types/game'

const company: Company = {
  name: 'Fieldwork', industry: 'SaaS', targetUsers: 'Founders', funds: 200000,
  users: 100, revenue: 20, teamMorale: 70, product: 80, marketHeat: 20,
  competition: 10, burnRate: 8, month: 1, maxDecisions: 3,
  fundraisingCount: 0, cooldowns: {},
}
afterEach(cleanup)

describe('Management disclosures', () => {
  it('exposes technology details through a labeled button and keeps purchase separate', () => {
    const purchase = vi.fn()
    render(<TechTreePanel company={company} onUnlock={purchase} />)
    const row = screen.getByRole('button', { name: /MVP Launch/ })
    expect(row).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'true')
    expect(purchase).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))
    expect(purchase).toHaveBeenCalledWith('mvp', 0)
    expect(row).toHaveAttribute('aria-expanded', 'true')
  })
  it('provides an accessible expandable market row', () => {
    render(<MarketPanel company={company} onExpand={vi.fn()} />)
    const row = screen.getByRole('button', { name: /United States/ })
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'false')
  })
  it('provides an accessible employee row and an independent hire action', () => {
    const hire = vi.fn()
    render(<EmployeePanel company={company} onHire={hire} />)
    const row = screen.getByRole('button', { name: /Junior Developer/ })
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Hire' }))
    expect(hire).toHaveBeenCalledWith('junior-dev', 8000)
  })
})


describe('Company creation', () => {
  it('requires target customers before leaving the first step', () => {
    render(<GameProvider><CreateCompany /></GameProvider>)
    fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'Fieldwork' } })
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Target customers'), { target: { value: 'Small businesses' } })
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeEnabled()
  })
})
