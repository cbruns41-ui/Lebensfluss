import { Link } from 'react-router-dom'
import {
  Target, Wallet, PiggyBank, UtensilsCrossed, CalendarDays, Flag,
  TrendingUp, Flame, ChevronRight, Droplets, Timer, Award, Quote, CalendarRange,
  Sparkles, Lightbulb, BarChart3, ShoppingCart, Sun,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressRing } from '../components/ui/ProgressRing'
import { computeAchievements } from '../lib/achievements'
import { getDailyQuote } from '../lib/quotes'
import { formatCurrency, toDateKey } from '../lib/utils'
import { getTodayHabitProgress } from '../lib/habits'
import { getTodayMeals, getMealPlanProgress } from '../lib/meals'
import { computeLifeScore, getLifeScoreHistory, getScoreColor } from '../lib/lifeScore'
import { generateInsights } from '../lib/insights'
import { isRitualDue, getActiveFocusMode, getActiveRitual } from '../lib/sundayRitual'
import { filterQuickLinks, FOCUS_MODE_LABELS } from '../lib/focusMode'

const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄']

export function Dashboard() {
  const { user } = useAuth()
  const { data } = useData()
  const today = toDateKey(new Date())
  const quote = getDailyQuote()

  const { done: todayDone, total: todayHabits } = getTodayHabitProgress(data.habits, data.habitCompletions)
  const habitProgress = todayHabits > 0 ? Math.round((todayDone / todayHabits) * 100) : 0

  const monthExpenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(today.slice(0, 7)))
    .reduce((s, t) => s + t.amount, 0)
  const monthBudget = data.budgetCategories.reduce((s, c) => s + c.limit, 0)

  const savingsDone = data.savingsWeeks.filter(w => w.completed).length
  const savingsTotal = data.savingsWeeks.filter(w => w.completed).reduce((s, w) => s + w.amount, 0)

  const waterToday = data.waterEntries.find(w => w.date === today)?.ml ?? 0
  const waterPct = Math.min((waterToday / data.settings.waterGoalMl) * 100, 100)

  const todayMood = data.moodEntries.find(m => m.date === today)?.mood
  const todayFocus = data.focusSessions
    .filter(s => s.type === 'work' && s.date === today)
    .reduce((s, f) => s + f.durationMin, 0)

  const achievements = computeAchievements(data)
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const lifeScore = computeLifeScore(data)
  const scoreHistory = getLifeScoreHistory(data, 7)
  const insights = generateInsights(data)
  const topInsight = insights[0]
  const todayMeals = getTodayMeals(data)
  const mealProgress = getMealPlanProgress(data.mealPlan)
  const unchecked = data.groceryList.filter(g => !g.checked).length
  const nextMeal = todayMeals
    ? [todayMeals.lunch, todayMeals.dinner, todayMeals.breakfast, todayMeals.snacks].find(m => m?.trim()) ?? null
    : null

  const activeRitual = getActiveRitual(data)
  const focusMode = getActiveFocusMode(data)
  const ritualDue = isRitualDue(data.weeklyRitual)
  const focusHabitIds = activeRitual.completedAt ? activeRitual.focusHabitIds : []
  const showFocusBanner = !!activeRitual.completedAt && focusMode !== 'full'

  const quickLinks = filterQuickLinks([
    ...(unchecked > 0 ? [{ to: '/app/einkauf', icon: ShoppingCart, label: 'Einkauf', stat: `${unchecked} offen`, color: 'text-purple-400' }] : []),
    { to: '/app/gewohnheiten', icon: Target, label: 'Gewohnheiten', stat: `${todayDone}/${todayHabits}`, color: 'text-emerald-400' },
    { to: '/app/wellness', icon: Droplets, label: 'Wellness', stat: `${waterToday}ml`, color: 'text-cyan-400' },
    { to: '/app/finanzen', icon: Wallet, label: 'Budget', stat: formatCurrency(monthExpenses), color: 'text-blue-400' },
    { to: '/app/fokus', icon: Timer, label: 'Fokus', stat: `${todayFocus} Min.`, color: 'text-indigo-400' },
    { to: '/app/essen', icon: UtensilsCrossed, label: 'Meal Prep', stat: mealProgress.percent > 0 ? `${mealProgress.percent}%` : `${data.groceryList.filter(g => !g.checked).length} Einkauf`, color: 'text-purple-400' },
    { to: '/app/spar-challenge', icon: PiggyBank, label: 'Spar-Challenge', stat: `${savingsDone}/52`, color: 'text-amber-400' },
    { to: '/app/planer', icon: CalendarDays, label: 'Planer', stat: `${data.plannerTasks.filter(t => !t.completed).length} Aufgaben`, color: 'text-cyan-400' },
    { to: '/app/ziele', icon: Flag, label: 'Ziele', stat: `${data.goals.length} aktiv`, color: 'text-pink-400' },
    { to: '/app/rueckblick', icon: CalendarRange, label: 'Rückblick', stat: 'Monat & Jahr', color: 'text-teal-400' },
  ], focusMode)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Guten Morgen'
    if (h < 18) return 'Guten Tag'
    return 'Guten Abend'
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title={`${user?.name} 👋`} subtitle={greeting()} helpId="dashboard" />

      {ritualDue && (
        <Link to="/app/wochenritual">
          <Card className="mb-4 border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-transparent hover:border-amber-500/50">
            <div className="flex items-center gap-3">
              <Sun size={22} className="text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sonntags-Ritual</p>
                <p className="text-xs text-muted">Starte fokussiert in die neue Woche — 5 Min.</p>
              </div>
              <ChevronRight size={16} className="text-amber-400" />
            </div>
          </Card>
        </Link>
      )}

      {showFocusBanner && (
        <Card className="mb-4 border-emerald-500/15 py-2.5 px-4">
          <p className="text-xs text-muted">
            <span className="text-emerald-400 font-medium">Fokus-Woche:</span> {FOCUS_MODE_LABELS[focusMode]}
            {focusHabitIds.length > 0 && ` · ${focusHabitIds.length} Prioritäts-Gewohnheit${focusHabitIds.length > 1 ? 'en' : ''}`}
          </p>
        </Card>
      )}

      {/* Quote */}
      <Card className="mb-4 border-emerald-500/10">
        <div className="flex gap-3">
          <Quote size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic leading-relaxed">„{quote.text}"</p>
            <p className="text-xs text-faint mt-1">— {quote.author}</p>
          </div>
        </div>
      </Card>

      {/* Life Score */}
      <Link to="/app/statistik">
        <Card className="mb-4 glow-accent">
          <div className="flex items-center gap-5">
            <ProgressRing progress={lifeScore.total} size={72} color={getScoreColor(lifeScore.total)}>
              <span className="text-sm font-bold">{lifeScore.total}</span>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="font-semibold text-sm">Life Score</span>
                <span className="text-xs text-emerald-400/80">{lifeScore.label}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {scoreHistory.map((h, i) => (
                  <div
                    key={h.date}
                    className="flex-1 rounded-sm min-h-[20px] self-end"
                    style={{
                      height: `${Math.max(4, (h.score / 100) * 20)}px`,
                      backgroundColor: getScoreColor(h.score),
                      opacity: i === scoreHistory.length - 1 ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-faint mt-1">7-Tage-Verlauf · Tippe für Details</p>
            </div>
          </div>
        </Card>
      </Link>

      {/* Habits + budget mini */}
      <Card className="mb-4">
        <div className="flex items-center gap-5">
          <ProgressRing progress={habitProgress} size={56}>
            <span className="text-xs font-bold">{habitProgress}%</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-400" />
              <span className="font-semibold text-sm">Gewohnheiten heute</span>
            </div>
            <p className="text-sm text-muted">
              {todayHabits === 0 ? 'Erstelle deine erste Gewohnheit!' : `${todayDone}/${todayHabits} erledigt`}
            </p>
            {monthBudget > 0 && (
              <p className="text-xs text-faint mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {formatCurrency(monthExpenses)} / {formatCurrency(monthBudget)}
              </p>
            )}
          </div>
          <Link to="/app/gewohnheiten" className="text-faint hover:text-emerald-400">
            <ChevronRight size={18} />
          </Link>
        </div>
      </Card>

      {unchecked > 0 && (
        <Link to="/app/einkauf?shop=1">
          <Card className="mb-4 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/35">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-purple-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Einkaufsliste</p>
                <p className="text-xs text-muted">{unchecked} Artikel offen — Einkaufsmodus</p>
              </div>
              <ChevronRight size={16} className="text-faint" />
            </div>
          </Card>
        </Link>
      )}

      {nextMeal && (
        <Link to="/app/essen">
          <Card className="mb-4 border-purple-500/15 hover:border-purple-500/30">
            <div className="flex items-center gap-3">
              <UtensilsCrossed size={18} className="text-purple-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-faint">Heute auf dem Plan</p>
                <p className="text-sm font-medium truncate">{nextMeal}</p>
              </div>
              <ChevronRight size={16} className="text-faint shrink-0" />
            </div>
          </Card>
        </Link>
      )}

      {topInsight && (
        <Card className="mb-4 border-emerald-500/15">
          <div className="flex gap-3">
            <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{topInsight.title}</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{topInsight.body}</p>
            </div>
            <Link to="/app/statistik" className="text-faint hover:text-emerald-400 shrink-0">
              <BarChart3 size={16} />
            </Link>
          </div>
        </Card>
      )}

      {/* Mini widgets */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Link to="/app/wellness">
          <Card className="text-center py-3 hover:border-cyan-500/30">
            <Droplets size={18} className="mx-auto text-cyan-400 mb-1" />
            <p className="text-xs font-bold">{Math.round(waterPct)}%</p>
            <p className="text-[10px] text-faint">Wasser</p>
          </Card>
        </Link>
        <Link to="/app/wellness">
          <Card className="text-center py-3 hover:border-purple-500/30">
            <span className="text-lg">{todayMood ? moodEmojis[todayMood] : '❓'}</span>
            <p className="text-[10px] text-faint mt-1">Stimmung</p>
          </Card>
        </Link>
        <Link to="/app/erfolge">
          <Card className="text-center py-3 hover:border-amber-500/30">
            <Award size={18} className="mx-auto text-amber-400 mb-1" />
            <p className="text-xs font-bold">{unlockedAchievements}</p>
            <p className="text-[10px] text-faint">Erfolge</p>
          </Card>
        </Link>
      </div>

      {savingsDone > 0 && (
        <Card className="mb-4 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400 font-medium">Spar-Challenge</p>
              <p className="text-xl font-bold">{formatCurrency(savingsTotal)}</p>
              <p className="text-xs text-muted">{savingsDone} Wochen ✓</p>
            </div>
            <PiggyBank size={32} className="text-amber-400/50" />
          </div>
        </Card>
      )}

      <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Schnellzugriff</h2>
      <div className="space-y-2">
        {quickLinks.map(({ to, icon: Icon, label, stat, color }) => (
          <Link key={to} to={to}>
            <Card className="flex items-center gap-4 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                <Icon size={20} className={color} />
              </div>
              <p className="flex-1 font-medium text-sm">{label}</p>
              <span className="text-sm text-muted">{stat}</span>
              <ChevronRight size={16} className="text-faint" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}