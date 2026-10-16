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
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-lg font-semibold text-ink">Achievements</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full bg-warning-soft rounded-full transition-colors duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted">{unlockedCount}/{total}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`relative group p-1.5 rounded-lg text-center transition-colors duration-200 ${
                isUnlocked
                  ? 'bg-warning-soft border border-warning-soft  '
                  : 'bg-paper border border-rule opacity-50 hover:opacity-50'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
              tabIndex={0}
              aria-label={`${achievement.name}: ${achievement.description}. ${isUnlocked ? 'Unlocked' : 'Locked'}`}
            >
              <div className="w-full h-8 flex items-center justify-center overflow-hidden">
                <div className="text-lg">{achievement.emoji}</div>
              </div>
              {isUnlocked && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success-soft border border-surface" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}