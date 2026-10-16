import { useState } from 'react'
import type { Company } from '../../types/game'
import { EMPLOYEE_ROLES, getAvailableEmployees } from '../../config/employees'

interface EmployeePanelProps {
  company: Company
  onHire: (employeeId: string, cost: number) => void
}

export function EmployeePanel({ company, onHire }: EmployeePanelProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const currentEmployees = company.employees || []
  const available = getAvailableEmployees(currentEmployees)
  const progress = Math.round((currentEmployees.length / EMPLOYEE_ROLES.length) * 100)

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <h3 className="text-lg font-semibold text-ink">Team</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-colors duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted">{currentEmployees.length}/{EMPLOYEE_ROLES.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {EMPLOYEE_ROLES.map(employee => {
          const isHired = currentEmployees.includes(employee.id)
          const isAvailable = available.some(a => a.id === employee.id)
          const isSelected = selectedEmployee === employee.id
          const canAfford = company.funds >= employee.cost
          const meetsRequirements = !employee.require ||
            Object.entries(employee.require).every(([key, value]) => {
              if (key === 'funds') return company.funds >= value
              return (company[key as keyof Company] as number) >= value
            })

          return (
            <div
              key={employee.id}
              className="management-row"

            >
              <button type="button" aria-expanded={isSelected} onClick={() => setSelectedEmployee(isSelected ? null : employee.id)} className="management-trigger">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                    <span className="text-sm origin-center transition-transform duration-200">{employee.emoji}</span>
                  </div>
                  <span className="text-sm font-medium text-ink">{employee.name}</span>
                </div>
                {isHired ? (
                  <span className="text-xs text-success">✓ Hired</span>
                ) : (
                  <span className="text-xs text-muted">${employee.cost.toLocaleString()}</span>
                )}
              </div>
              </button>

              {isSelected && !isHired && (
                <div className="mt-2 pt-2 border-t border-rule">
                  <p className="text-xs text-muted mb-2">{employee.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(employee.effects).map(([key, val]) => (
                      <span key={key} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        (val as number) > 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      }`}>
                        {(val as number) > 0 ? '+' : ''}{val} {key}
                      </span>
                    ))}
                  </div>
                  {isAvailable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford && meetsRequirements) onHire(employee.id, employee.cost)
                      }}
                      disabled={!canAfford || !meetsRequirements}
                      className={`w-full py-2 text-sm rounded ${
                        canAfford && meetsRequirements
                          ? 'bg-accent text-on-accent'
                          : 'bg-paper text-muted'
                      }`}
                    >
                      {!canAfford ? 'Not enough funds' : !meetsRequirements ? 'Requirements not met' : 'Hire'}
                    </button>
                  ) : (
                    <p className="text-xs text-warning">
                      Requires: {Object.entries(employee.require || {}).map(([k, v]) => `${k} ≥ ${v}`).join(', ')}
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
