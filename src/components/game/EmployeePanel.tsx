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
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <h3 className="text-sm font-bold text-white">Team</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{currentEmployees.length}/{EMPLOYEE_ROLES.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
              onClick={() => setSelectedEmployee(isSelected ? null : employee.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                isHired
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
                  <span className="text-sm origin-center group-hover:scale-125 transition-transform duration-200">{employee.emoji}</span>
                  <span className="text-xs font-medium text-white">{employee.name}</span>
                </div>
                {isHired ? (
                  <span className="text-[10px] text-emerald-400">✓ Hired</span>
                ) : (
                  <span className="text-[10px] text-slate-400">${employee.cost.toLocaleString()}</span>
                )}
              </div>

              {isSelected && !isHired && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <p className="text-[10px] text-slate-400 mb-2">{employee.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(employee.effects).map(([key, val]) => (
                      <span key={key} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        (val as number) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
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
                      className={`w-full py-1 text-[10px] rounded ${
                        canAfford && meetsRequirements
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {!canAfford ? 'Not enough funds' : !meetsRequirements ? 'Requirements not met' : 'Hire'}
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-400">
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
