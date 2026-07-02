import type { Company } from '../../types/game'
import { ACHIEVEMENTS } from '../../config/achievements'

interface AchievementsProps {
  company: Company
}

export function AchievementsPanel({ company }: AchievementsProps) {
  const unlocked = company.unlockedAchievements || []
  const total = ACHIEVEMENTS.length
  const unlockedCount = unlocked.length
  const progress = Math.round((unlockedCount / total) * 100)

  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-sm font-bold text-white">Achievements</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{unlockedCount}/{total}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`relative group p-1.5 rounded-lg text-center transition-all duration-200 hover:scale-110 ${
                isUnlocked
                  ? 'bg-amber-500/15 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/30 border border-slate-700/20 opacity-30 hover:opacity-50'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
            >
              <div className="text-sm">{achievement.emoji}</div>
              {isUnlocked && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#1e1e3a]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}