import { computeAchievements } from '../lib/achievements'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

export function AchievementsPage() {
  const { data } = useData()
  const achievements = computeAchievements(data)
  const unlocked = achievements.filter(a => a.unlocked)

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Erfolge" subtitle={`${unlocked.length} von ${achievements.length} Abzeichen`} helpId="erfolge" />

      <Card className="mb-6 text-center py-6 bg-gradient-to-br from-amber-500/15 to-transparent">
        <p className="text-4xl mb-2">🏅</p>
        <p className="text-2xl font-bold">{unlocked.length}</p>
        <p className="text-sm text-muted">Abzeichen gesammelt</p>
      </Card>

      <div className="space-y-3">
        {achievements.map(a => (
          <Card
            key={a.id}
            className={cn(
              'flex items-center gap-4 py-3.5 transition-all',
              !a.unlocked && 'opacity-50 grayscale',
            )}
          >
            <span className="text-3xl">{a.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-muted">{a.description}</p>
              {a.target && !a.unlocked && (
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${((a.progress ?? 0) / a.target) * 100}%` }}
                  />
                </div>
              )}
            </div>
            {a.unlocked && <span className="text-xs text-amber-400 font-medium">✓</span>}
          </Card>
        ))}
      </div>
    </div>
  )
}