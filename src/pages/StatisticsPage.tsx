import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Award, TrendingUp, ChevronRight, Download, Sparkles, Lightbulb, Share2 } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MiniChart } from '../components/ui/MiniChart'
import { PageHeader } from '../components/ui/PageHeader'
import { computeAchievements } from '../lib/achievements'
import { exportStatsCsv } from '../lib/exportCsv'
import { formatCurrency, toDateKey, cn } from '../lib/utils'
import { computeLifeScore, getLifeScoreForDate, getScoreColor } from '../lib/lifeScore'
import { generateInsights } from '../lib/insights'
import { ProgressRing } from '../components/ui/ProgressRing'
import { buildWeeklyLifeScoreReport, shareWeeklyReport } from '../lib/lifeScoreReport'

type Range = '7d' | '30d' | '12m'

export function StatisticsPage() {
  const { user } = useAuth()
  const { data } = useData()
  const [range, setRange] = useState<Range>('7d')
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const achievements = computeAchievements(data)
  const unlocked = achievements.filter(a => a.unlocked).length

  const getDays = (): string[] => {
    if (range === '7d') return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return toDateKey(d) })
    if (range === '30d') return Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return toDateKey(d) })
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11 - i))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
  }

  const keys = getDays()
  const isMonth = range === '12m'

  const habitData = keys.map(key =>
    data.habits.length > 0
      ? Math.round((data.habitCompletions.filter(c => isMonth ? c.date.startsWith(key) : c.date === key).length / (isMonth ? data.habits.length * 30 : data.habits.length)) * 100)
      : 0,
  )

  const expenseData = keys.map(key =>
    data.transactions.filter(t => t.type === 'expense' && (isMonth ? t.date.startsWith(key) : t.date === key)).reduce((s, t) => s + t.amount, 0),
  )

  const focusData = keys.map(key =>
    data.focusSessions.filter(s => s.type === 'work' && (isMonth ? s.date.startsWith(key) : s.date === key)).reduce((s, f) => s + f.durationMin, 0),
  )

  const avgMoodNum = data.moodEntries.length > 0
    ? data.moodEntries.slice(0, 30).reduce((s, m) => s + m.mood, 0) / Math.min(data.moodEntries.length, 30) : 0

  const totalSaved = data.savingsWeeks.filter(w => w.completed).reduce((s, w) => s + w.amount, 0)
  const lifeScore = computeLifeScore(data)
  const insights = generateInsights(data)

  const lifeScoreData = keys.map(key => {
    if (isMonth) {
      const [y, m] = key.split('-').map(Number)
      const daysInMonth = new Date(y, m, 0).getDate()
      let sum = 0
      for (let d = 1; d <= daysInMonth; d++) {
        sum += getLifeScoreForDate(data, `${key}-${String(d).padStart(2, '0')}`)
      }
      return Math.round(sum / daysInMonth)
    }
    return getLifeScoreForDate(data, key)
  })

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Statistik" subtitle="Fortschritte auf einen Blick" helpId="statistik"
        actions={<Button size="sm" variant="secondary" onClick={() => exportStatsCsv(data)}><Download size={16} /> CSV</Button>} />

      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        {([{ id: '7d' as Range, label: '7 Tage' }, { id: '30d' as Range, label: '30 Tage' }, { id: '12m' as Range, label: '12 Monate' }]).map(({ id, label }) => (
          <button key={id} onClick={() => setRange(id)} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', range === id ? 'bg-emerald-500 text-white' : 'text-muted')}>{label}</button>
        ))}
      </div>

      <Card className="mb-6 glow-accent">
        <div className="flex items-center gap-5">
          <ProgressRing progress={lifeScore.total} size={80} color={getScoreColor(lifeScore.total)}>
            <span className="text-lg font-bold">{lifeScore.total}</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="font-semibold">Life Score</span>
              <span className="text-xs text-emerald-400">{lifeScore.label}</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-[10px] text-faint mt-2">
              {[
                { k: 'Gewohnh.', v: lifeScore.habits },
                { k: 'Wellness', v: lifeScore.wellness },
                { k: 'Budget', v: lifeScore.budget },
                { k: 'Fokus', v: lifeScore.focus },
                { k: 'Reflexion', v: lifeScore.reflection },
              ].map(b => (
                <div key={b.k} className="text-center">
                  <div className="h-1 rounded-full bg-slate-800 mb-0.5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.v}%` }} />
                  </div>
                  <span>{b.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6 border-emerald-500/15">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Wochenreport</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const result = await shareWeeklyReport(data, user?.name)
              setShareStatus(
                result === 'shared' ? 'Geteilt!' : result === 'copied' ? 'Kopiert!' : 'Fehlgeschlagen',
              )
              setTimeout(() => setShareStatus(null), 2500)
            }}
          >
            <Share2 size={14} /> Teilen
          </Button>
        </div>
        <p className="text-xs text-muted mb-2">Regelbasierte Zusammenfassung — teilbar per System-Dialog oder Zwischenablage.</p>
        {shareStatus && <p className="text-xs text-emerald-400 mb-2">{shareStatus}</p>}
        <button
          type="button"
          onClick={() => setShowReport(v => !v)}
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          {showReport ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </button>
        {showReport && (
          <pre className="mt-3 text-[10px] text-muted whitespace-pre-wrap font-sans leading-relaxed p-3 rounded-xl bg-slate-800/50 max-h-48 overflow-y-auto">
            {buildWeeklyLifeScoreReport(data, user?.name)}
          </pre>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Erfolge', value: `${unlocked}/${achievements.length}`, color: 'text-amber-400' },
          { label: 'Ø Stimmung', value: avgMoodNum > 0 ? `${avgMoodNum.toFixed(1)}/5` : '–', color: 'text-purple-400' },
          { label: 'Gespart', value: formatCurrency(totalSaved), color: 'text-amber-400' },
          { label: 'Gewohnheiten', value: String(data.habits.length), color: 'text-emerald-400' },
        ].map(s => (
          <Card key={s.label} className="text-center py-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-emerald-400" /><span className="text-sm font-medium">Life Score</span></div>
        <MiniChart data={lifeScoreData} color={getScoreColor(lifeScore.total)} height={range === '12m' ? 60 : 80} />
      </Card>

      <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
        <Lightbulb size={14} className="text-amber-400" /> Insights
      </h2>
      <div className="space-y-2 mb-6">
        {insights.map(ins => (
          <Card key={ins.id} className={cn('py-3',
            ins.tone === 'positive' && 'border-emerald-500/20',
            ins.tone === 'tip' && 'border-amber-500/20',
          )}>
            <p className="text-sm font-medium">{ins.title}</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">{ins.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-400" /><span className="text-sm font-medium">Gewohnheiten %</span></div>
        <MiniChart data={habitData} color="#10b981" height={range === '12m' ? 60 : 80} />
      </Card>
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-blue-400" /><span className="text-sm font-medium">Ausgaben €</span></div>
        <MiniChart data={expenseData} color="#3b82f6" height={range === '12m' ? 60 : 80} />
      </Card>
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-cyan-400" /><span className="text-sm font-medium">Fokus Min.</span></div>
        <MiniChart data={focusData} color="#06b6d4" height={range === '12m' ? 60 : 80} />
      </Card>

      <Link to="/app/erfolge"><Card className="flex items-center gap-4 py-4 mb-4">
        <Award size={20} className="text-amber-400" />
        <div className="flex-1"><p className="font-medium text-sm">Erfolge</p><p className="text-xs text-muted">{unlocked}/{achievements.length}</p></div>
        <ChevronRight size={16} className="text-faint" />
      </Card></Link>
      <Link to="/app/rueckblick"><Card className="flex items-center gap-4 py-4 mb-4">
        <p className="flex-1 font-medium text-sm">Rückblick (Monat & Jahr)</p>
        <ChevronRight size={16} className="text-faint" />
      </Card></Link>
      <Link to="/app/wochenreview"><Card className="flex items-center gap-4 py-4">
        <p className="flex-1 font-medium text-sm">Wochenreview</p>
        <ChevronRight size={16} className="text-faint" />
      </Card></Link>
    </div>
  )
}