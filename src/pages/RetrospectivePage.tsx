import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Target, Droplets, Wallet, Smile, Moon,
  Timer, BookOpen, ClipboardList, TrendingUp, Sparkles,
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { MiniChart } from '../components/ui/MiniChart'
import { computeMonthSummary, computeYearSummary } from '../lib/retrospective'
import { formatCurrency, formatMonthYear, cn } from '../lib/utils'

type Tab = 'month' | 'year'

export function RetrospectivePage() {
  const { data } = useData()
  const [tab, setTab] = useState<Tab>('month')
  const [cursor, setCursor] = useState(new Date())

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthSummary = computeMonthSummary(data, year, month)
  const yearSummary = computeYearSummary(data, year)

  const savingsDone = data.savingsWeeks.filter(w => w.completed).length
  const savingsTotal = data.savingsWeeks.filter(w => w.completed).reduce((s, w) => s + w.amount, 0)
  const plannerDone = data.plannerTasks.filter(t => t.completed).length

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1))
  }

  const shiftYear = (delta: number) => {
    setCursor(new Date(year + delta, month, 1))
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto pb-8">
      <PageHeader title="Rückblick" subtitle="Monats- & Jahresübersicht" helpId="rueckblick" />

      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        {([{ id: 'month' as Tab, label: 'Monat' }, { id: 'year' as Tab, label: 'Jahr' }]).map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('flex-1 py-2.5 rounded-lg text-sm font-medium', tab === id ? 'bg-emerald-500 text-white' : 'text-muted')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'month' ? (
        <>
          <div className="flex items-center justify-between mb-6 glass rounded-xl px-3 py-2">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-700/50"><ChevronLeft size={18} /></button>
            <span className="font-medium capitalize">{monthSummary.label}</span>
            <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-700/50"><ChevronRight size={18} /></button>
          </div>

          <Card className="mb-4 bg-gradient-to-br from-emerald-500/15 to-transparent border-emerald-500/20">
            <div className="flex items-center gap-3">
              <Target size={24} className="text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{monthSummary.habits.completionRate}%</p>
                <p className="text-sm text-muted">Gewohnheiten erledigt</p>
                <p className="text-xs text-faint">{monthSummary.habits.totalCompletions} Häkchen in {monthSummary.daysInMonth} Tagen</p>
              </div>
            </div>
            {monthSummary.habits.bestHabit && (
              <p className="text-xs text-muted mt-3 pt-3 border-t border-slate-700/50">
                Beste Gewohnheit: {monthSummary.habits.bestHabit.icon} {monthSummary.habits.bestHabit.name} ({monthSummary.habits.bestHabit.rate}%)
              </p>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard icon={Droplets} color="cyan" label="Wasser-Ziel" value={`${monthSummary.water.daysGoalReached}/${monthSummary.daysInMonth}`}
              sub={monthSummary.water.daysTracked > 0 ? `${(monthSummary.water.totalMl / 1000).toFixed(1)}L gesamt` : 'Keine Einträge'} />
            <MetricCard icon={Wallet} color="blue" label="Saldo" value={formatCurrency(monthSummary.budget.balance)}
              sub={`${formatCurrency(monthSummary.budget.expenses)} ausgegeben`} />
            <MetricCard icon={Smile} color="purple" label="Ø Stimmung" value={monthSummary.wellness.avgMood > 0 ? `${monthSummary.wellness.avgMood.toFixed(1)}/5` : '–'}
              sub={`${monthSummary.wellness.moodDays} Tage erfasst`} />
            <MetricCard icon={Moon} color="indigo" label="Ø Schlaf" value={monthSummary.wellness.avgSleepHours > 0 ? `${monthSummary.wellness.avgSleepHours.toFixed(1)}h` : '–'}
              sub={`${monthSummary.wellness.sleepDays} Nächte`} />
            <MetricCard icon={Timer} color="emerald" label="Fokuszeit" value={`${monthSummary.focus.totalMinutes} Min.`}
              sub={`${monthSummary.focus.sessions} Sessions`} />
            <MetricCard icon={BookOpen} color="rose" label="Tagebuch" value={String(monthSummary.journal.total)}
              sub={`${monthSummary.journal.gratitude} Dankbarkeit`} />
          </div>

          {monthSummary.budget.topCategory && (
            <Card className="mb-4">
              <p className="text-xs text-muted mb-2">Top-Ausgabenkategorie</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: monthSummary.budget.topCategory.color }} />
                  <span className="font-medium">{monthSummary.budget.topCategory.name}</span>
                </div>
                <span className="text-red-400 font-medium">{formatCurrency(monthSummary.budget.topCategory.amount)}</span>
              </div>
            </Card>
          )}

          <Card className="mb-4">
            <p className="text-xs text-muted mb-3 flex items-center gap-2"><ClipboardList size={14} /> Weitere Bereiche (Gesamtstand)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Spar-Challenge</span><span>{savingsDone}/52 · {formatCurrency(savingsTotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Planer-Aufgaben</span><span>{plannerDone}/{data.plannerTasks.length} erledigt</span></div>
              <div className="flex justify-between"><span className="text-muted">Wochenreviews</span><span>{monthSummary.reviews} diesen Monat</span></div>
            </div>
            <p className="text-[10px] text-faint mt-3">Spar-Challenge & Planer haben kein Tagesdatum – hier siehst du den aktuellen Gesamtstand.</p>
          </Card>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 glass rounded-xl px-3 py-2">
            <button onClick={() => shiftYear(-1)} className="p-1.5 rounded-lg hover:bg-slate-700/50"><ChevronLeft size={18} /></button>
            <span className="font-medium">{year}</span>
            <button onClick={() => shiftYear(1)} className="p-1.5 rounded-lg hover:bg-slate-700/50"><ChevronRight size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Ø Gewohnheiten', value: `${yearSummary.totals.habitRate}%`, color: 'text-emerald-400' },
              { label: 'Ausgaben', value: formatCurrency(yearSummary.totals.expenses), color: 'text-red-400' },
              { label: 'Einnahmen', value: formatCurrency(yearSummary.totals.income), color: 'text-emerald-400' },
              { label: 'Fokuszeit', value: `${yearSummary.totals.focusMin} Min.`, color: 'text-cyan-400' },
              { label: 'Wasser-Ziel-Tage', value: String(yearSummary.totals.waterGoalDays), color: 'text-cyan-400' },
              { label: 'Tagebuch', value: String(yearSummary.totals.journalEntries), color: 'text-rose-400' },
            ].map(s => (
              <Card key={s.label} className="text-center py-4">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </Card>
            ))}
          </div>

          <Card className="mb-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" /> Gewohnheiten pro Monat (%)</p>
            <MiniChart data={yearSummary.months.map(m => m.habitRate)} labels={yearSummary.months.map(m => m.label)} color="#10b981" height={100} />
          </Card>

          <Card className="mb-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><Wallet size={16} className="text-blue-400" /> Ausgaben pro Monat (€)</p>
            <MiniChart data={yearSummary.months.map(m => m.expenses)} labels={yearSummary.months.map(m => m.label)} color="#3b82f6" height={100} />
          </Card>

          <Card className="mb-6">
            <p className="text-sm font-medium mb-4 flex items-center gap-2"><Sparkles size={16} className="text-amber-400" /> Highlights {year}</p>
            <div className="space-y-3">
              <HighlightRow label="Bester Monat (Gewohnheiten)" value={yearSummary.highlights.bestHabitMonth ? `${yearSummary.highlights.bestHabitMonth.label} · ${yearSummary.highlights.bestHabitMonth.rate}%` : '–'} />
              <HighlightRow label="Höchste Ausgaben" value={yearSummary.highlights.highestExpenseMonth ? `${yearSummary.highlights.highestExpenseMonth.label} · ${formatCurrency(yearSummary.highlights.highestExpenseMonth.amount)}` : '–'} />
              <HighlightRow label="Meiste Fokuszeit" value={yearSummary.highlights.mostFocusMonth ? `${yearSummary.highlights.mostFocusMonth.label} · ${yearSummary.highlights.mostFocusMonth.minutes} Min.` : '–'} />
              <HighlightRow label="Beste Stimmung" value={yearSummary.highlights.bestMoodMonth ? `${yearSummary.highlights.bestMoodMonth.label} · ${yearSummary.highlights.bestMoodMonth.mood.toFixed(1)}/5` : '–'} />
            </div>
          </Card>

          <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Monats-Kacheln</h2>
          <div className="grid grid-cols-3 gap-2">
            {yearSummary.months.map((m, i) => (
              <button key={m.month} onClick={() => { setCursor(new Date(year, i, 1)); setTab('month') }}
                className="glass rounded-xl p-3 text-left hover:border-emerald-500/30 transition-all active:scale-95">
                <p className="text-xs font-medium capitalize mb-2">{formatMonthYear(new Date(year, i, 1)).split(' ')[0]}</p>
                <p className="text-lg font-bold text-emerald-400">{m.habitRate}%</p>
                <p className="text-[10px] text-faint">{formatCurrency(m.expenses)}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, color, label, value, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  label: string
  value: string
  sub: string
}) {
  const colors: Record<string, string> = {
    cyan: 'text-cyan-400', blue: 'text-blue-400', purple: 'text-purple-400',
    indigo: 'text-indigo-400', emerald: 'text-emerald-400', rose: 'text-rose-400',
  }
  return (
    <Card className="py-4">
      <Icon size={18} className={cn('mb-2', colors[color])} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-[10px] text-faint mt-1">{sub}</p>
    </Card>
  )
}

function HighlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}