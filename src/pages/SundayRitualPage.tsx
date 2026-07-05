import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Check, Sparkles, Target, Wallet,
  UtensilsCrossed, Share2, Sun,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { buildWeeklyStatsSummary } from '../lib/weeklyReviewGuide'
import {
  RITUAL_STEPS, completeRitual, formatWeekRange, getActiveRitual,
  getBudgetRitualStatus, getMealRitualStatus, getWeekStart,
} from '../lib/sundayRitual'
import {
  FOCUS_MODE_DESCRIPTIONS, FOCUS_MODE_ICONS, FOCUS_MODE_LABELS,
} from '../lib/focusMode'
import { shareWeeklyReport } from '../lib/lifeScoreReport'
import { formatCurrency, cn } from '../lib/utils'
import type { FocusMode } from '../types'

const MAX_FOCUS_HABITS = 3

export function SundayRitualPage() {
  const { user } = useAuth()
  const { data, updateData } = useData()
  const navigate = useNavigate()
  const ritual = getActiveRitual(data)
  const [step, setStep] = useState(0)
  const [focusHabitIds, setFocusHabitIds] = useState<string[]>(ritual.focusHabitIds)
  const [focusMode, setFocusMode] = useState<FocusMode>(ritual.focusMode)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const statsSummary = buildWeeklyStatsSummary(data)
  const mealStatus = getMealRitualStatus(data)
  const budgetStatus = getBudgetRitualStatus(data)
  const weekLabel = formatWeekRange(getWeekStart())

  const toggleHabit = (id: string) => {
    setFocusHabitIds(prev =>
      prev.includes(id)
        ? prev.filter(h => h !== id)
        : prev.length < MAX_FOCUS_HABITS ? [...prev, id] : prev,
    )
  }

  const finishRitual = () => {
    updateData(prev => ({
      ...prev,
      weeklyRitual: completeRitual(focusHabitIds, focusMode),
    }))
    setStep(RITUAL_STEPS.length)
  }

  const handleShare = async () => {
    const result = await shareWeeklyReport(data, user?.name)
    setShareStatus(
      result === 'shared' ? 'Geteilt!' : result === 'copied' ? 'In Zwischenablage kopiert!' : 'Teilen fehlgeschlagen',
    )
    setTimeout(() => setShareStatus(null), 3000)
  }

  const stepInfo = RITUAL_STEPS[step]

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto pb-8">
      <PageHeader
        title="Sonntags-Ritual"
        subtitle={`Wochenstart · ${weekLabel}`}
        helpId="wochenritual"
      />

      {step < RITUAL_STEPS.length && (
        <div className="flex gap-1 mb-6">
          {RITUAL_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-emerald-500' : 'bg-slate-800',
              )}
            />
          ))}
        </div>
      )}

      {step === 0 && (
        <>
          <Card className="mb-4 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
            <div className="flex gap-3">
              <Sun size={22} className="text-amber-400 shrink-0" />
              <div>
                <p className="font-medium text-sm">Dein geführter Wochenstart</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  In 5 kurzen Schritten: Rückblick, Fokus setzen, Essen & Budget checken — dann startest du fokussiert in die Woche.
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-4 border-emerald-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-sm font-medium">{stepInfo.title}</span>
            </div>
            <pre className="text-xs text-muted whitespace-pre-wrap font-sans leading-relaxed">{statsSummary}</pre>
            <Link to="/app/wochenreview" className="block mt-3">
              <Button variant="secondary" size="sm" className="w-full">Wochenreview öffnen</Button>
            </Link>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/app')}>Später</Button>
            <Button className="flex-1" onClick={() => setStep(1)}>
              Weiter <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <Card className="mb-4">
            <p className="text-sm font-medium mb-1">{stepInfo.title}</p>
            <p className="text-xs text-muted mb-4">{stepInfo.subtitle}</p>
            {data.habits.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">
                Noch keine Gewohnheiten —{' '}
                <Link to="/app/gewohnheiten" className="text-emerald-400">jetzt anlegen</Link>
              </p>
            ) : (
              <div className="space-y-2">
                {data.habits.map(habit => {
                  const selected = focusHabitIds.includes(habit.id)
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                        selected ? 'bg-emerald-500/20 border border-emerald-500/40' : 'glass hover:border-slate-600',
                      )}
                    >
                      <span className="text-lg">{habit.icon}</span>
                      <span className="flex-1 text-sm font-medium">{habit.name}</span>
                      {selected && <Check size={16} className="text-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            )}
            <p className="text-[10px] text-faint mt-3">{focusHabitIds.length}/{MAX_FOCUS_HABITS} ausgewählt</p>
          </Card>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(0)}><ChevronLeft size={16} /> Zurück</Button>
            <Button className="flex-1" onClick={() => setStep(2)}>Weiter <ChevronRight size={16} /></Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card className="mb-4">
            <p className="text-sm font-medium mb-1">{stepInfo.title}</p>
            <p className="text-xs text-muted mb-4">{stepInfo.subtitle}</p>
            <div className="space-y-2">
              {(['full', 'light', 'basics'] as FocusMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFocusMode(mode)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all',
                    focusMode === mode ? 'bg-emerald-500/20 border border-emerald-500/40' : 'glass',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{FOCUS_MODE_ICONS[mode]}</span>
                    <span className="font-medium text-sm">{FOCUS_MODE_LABELS[mode]}</span>
                    {focusMode === mode && <Check size={14} className="text-emerald-400 ml-auto" />}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{FOCUS_MODE_DESCRIPTIONS[mode]}</p>
                </button>
              ))}
            </div>
          </Card>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft size={16} /> Zurück</Button>
            <Button className="flex-1" onClick={() => setStep(3)}>Weiter <ChevronRight size={16} /></Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed size={18} className="text-purple-400" />
              <span className="text-sm font-medium">{stepInfo.title}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${mealStatus.percent}%` }}
              />
            </div>
            <p className="text-sm text-muted">
              {mealStatus.percent}% der Woche geplant
              {mealStatus.ready ? ' — gut vorbereitet!' : ' — noch Luft nach oben'}
            </p>
            <Link to="/app/essen" className="block mt-3">
              <Button variant="secondary" size="sm" className="w-full">Meal Prep öffnen</Button>
            </Link>
          </Card>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(2)}><ChevronLeft size={16} /> Zurück</Button>
            <Button className="flex-1" onClick={() => setStep(4)}>Weiter <ChevronRight size={16} /></Button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={18} className="text-blue-400" />
              <span className="text-sm font-medium">{stepInfo.title}</span>
            </div>
            {budgetStatus.limit > 0 ? (
              <>
                <p className="text-2xl font-bold mb-1">
                  {formatCurrency(budgetStatus.expenses)}
                  <span className="text-sm text-muted font-normal"> / {formatCurrency(budgetStatus.limit)}</span>
                </p>
                <p className={cn('text-sm', budgetStatus.ok ? 'text-emerald-400' : 'text-amber-400')}>
                  {budgetStatus.ok ? 'Im Budget — weiter so!' : 'Budget überschritten — nächste Woche genauer planen'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Noch kein Budget eingerichtet.</p>
            )}
            <Link to="/app/finanzen" className="block mt-3">
              <Button variant="secondary" size="sm" className="w-full">Budget öffnen</Button>
            </Link>
          </Card>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(3)}><ChevronLeft size={16} /> Zurück</Button>
            <Button className="flex-1" onClick={finishRitual}>
              Ritual abschließen <Check size={16} />
            </Button>
          </div>
        </>
      )}

      {step >= RITUAL_STEPS.length && (
        <>
          <Card className="mb-4 text-center py-8 border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <Sparkles size={40} className="mx-auto text-emerald-400 mb-3" />
            <p className="font-bold text-lg mb-1">Woche gestartet!</p>
            <p className="text-sm text-muted">
              {FOCUS_MODE_LABELS[focusMode]}
              {focusHabitIds.length > 0 && ` · ${focusHabitIds.length} Fokus-Gewohnheit${focusHabitIds.length > 1 ? 'en' : ''}`}
            </p>
          </Card>

          {focusHabitIds.length > 0 && (
            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">Deine Fokus-Gewohnheiten</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {focusHabitIds.map(id => {
                  const h = data.habits.find(x => x.id === id)
                  return h ? (
                    <span key={id} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                      {h.icon} {h.name}
                    </span>
                  ) : null
                })}
              </div>
            </Card>
          )}

          <Card className="mb-4">
            <p className="text-sm font-medium mb-2">Life Score Wochenreport</p>
            <p className="text-xs text-muted mb-3">Teile deine Woche — regelbasiert, ohne KI.</p>
            <Button variant="secondary" className="w-full" onClick={handleShare}>
              <Share2 size={16} /> Report teilen / kopieren
            </Button>
            {shareStatus && <p className="text-xs text-emerald-400 text-center mt-2">{shareStatus}</p>}
          </Card>

          <Button className="w-full" onClick={() => navigate('/app')}>Zum Dashboard</Button>
        </>
      )}
    </div>
  )
}