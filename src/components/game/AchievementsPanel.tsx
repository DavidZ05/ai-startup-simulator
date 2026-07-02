import type { Company } from '../../types/game'
import { ACHIEVEMENTS } from '../../config/achievements'

interface AchievementsProps {
  company: Company
}

export function AchievementsPanel({ company }: AchievementsProps) {
  const unlocked = company.unlockedAchievements || []
  const total = ACHIEVEMENTS.length
  const unlockedCount = unlocked.length

  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-sm font-bold text-white">Achievements</h3>
        </div>
        <span className="text-xs text-slate-400">{unlockedCount}/{total}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`relative group p-2 rounded-lg text-center transition-all ${
                isUnlocked
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'bg-slate-800/30 border border-slate-700/30 opacity-40'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
            >
              <div className="text-lg">{achievement.emoji}</div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#1e1e3a] hidden group-hover:block" />
            </div>
          )
        })}
      </div>
    </div>
  )
}