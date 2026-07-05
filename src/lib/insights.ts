import type { AppData } from '../types'
import { getTodayHabitProgress, getHabitStreak, migrateHabits } from './habits'
import { toDateKey, formatCurrency } from './utils'
import { computeWeeklyMealCosts, findFoodCategory } from './mealBudget'

export interface Insight {
  id: string
  title: string
  body: string
  tone: 'positive' | 'neutral' | 'tip'
}

export function generateInsights(data: AppData): Insight[] {
  const insights: Insight[] = []
  const today = toDateKey(new Date())

  const habits = migrateHabits(data.habits)
  if (habits.length > 0) {
    const maxStreak = Math.max(0, ...habits.map(h => getHabitStreak(h, data.habitCompletions)))
    if (maxStreak >= 7) {
      insights.push({
        id: 'streak',
        title: 'Starker Streak',
        body: `Deine längste aktive Serie: ${maxStreak} ${habits.find(h => getHabitStreak(h, data.habitCompletions) === maxStreak)?.schedule === 'weekly' ? 'Wochen' : 'Tage'}.`,
        tone: 'positive',
      })
    }
  }

  const sleepByDate = new Map(data.sleepEntries.map(s => [s.date, s.hours]))
  const habitPctByDate: { date: string; pct: number }[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    const { done, total } = getTodayHabitProgress(data.habits, data.habitCompletions, d)
    if (total > 0) habitPctByDate.push({ date: key, pct: done / total })
  }

  const goodSleepDays = habitPctByDate.filter(({ date }) => (sleepByDate.get(date) ?? 0) >= 7)
  const badSleepDays = habitPctByDate.filter(({ date }) => (sleepByDate.get(date) ?? 0) > 0 && (sleepByDate.get(date) ?? 0) < 6)
  if (goodSleepDays.length >= 3 && badSleepDays.length >= 2) {
    const avgGood = goodSleepDays.reduce((s, x) => s + x.pct, 0) / goodSleepDays.length
    const avgBad = badSleepDays.reduce((s, x) => s + x.pct, 0) / badSleepDays.length
    if (avgGood > avgBad + 0.15) {
      insights.push({
        id: 'sleep-habits',
        title: 'Schlaf & Gewohnheiten',
        body: `Nach erholsamen Nächten (7h+) erledigst du im Schnitt ${Math.round(avgGood * 100)} % deiner Gewohnheiten – bei wenig Schlaf nur ${Math.round(avgBad * 100)} %.`,
        tone: 'tip',
      })
    }
  }

  const moods = data.moodEntries.slice(0, 14)
  if (moods.length >= 5) {
    const avg = moods.reduce((s, m) => s + m.mood, 0) / moods.length
    if (avg >= 4) {
      insights.push({ id: 'mood-high', title: 'Gute Stimmung', body: `Dein Stimmungs-Schnitt der letzten Einträge: ${avg.toFixed(1)}/5.`, tone: 'positive' })
    } else if (avg <= 2.5) {
      insights.push({ id: 'mood-low', title: 'Achtsamkeit', body: 'Deine Stimmung war zuletzt eher niedrig – Wellness & Tagebuch können helfen.', tone: 'tip' })
    }
  }

  const monthKey = today.slice(0, 7)
  const expenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthKey)).reduce((s, t) => s + t.amount, 0)
  const budget = data.budgetCategories.reduce((s, c) => s + c.limit, 0)
  if (budget > 0 && expenses > budget * 0.9) {
    insights.push({
      id: 'budget-warn',
      title: 'Budget im Blick',
      body: expenses > budget
        ? `Du liegst ${Math.round(((expenses / budget) - 1) * 100)} % über dem Monatsbudget.`
        : `Noch ${Math.round((1 - expenses / budget) * 100)} % Budget übrig diesen Monat.`,
      tone: expenses > budget ? 'tip' : 'neutral',
    })
  }

  const focusWeek = data.focusSessions
    .filter(s => s.type === 'work')
    .slice(0, 20)
    .reduce((s, f) => s + f.durationMin, 0)
  if (focusWeek >= 120) {
    insights.push({ id: 'focus', title: 'Fokus-Star', body: `${focusWeek} Minuten Fokuszeit in deinen letzten Sessions – stark!`, tone: 'positive' })
  }

  const mealCosts = computeWeeklyMealCosts(data.mealPlan, data.recipes)
  const foodCat = findFoodCategory(data.budgetCategories)
  if (mealCosts.estimatedTotal > 0 && foodCat) {
    const spent = data.transactions
      .filter(t => t.type === 'expense' && t.categoryId === foodCat.id && t.date.startsWith(monthKey))
      .reduce((s, t) => s + t.amount, 0)
    const remaining = foodCat.limit - spent
    if (remaining < mealCosts.estimatedTotal) {
      insights.push({
        id: 'meal-budget',
        title: 'Meal Prep & Budget',
        body: `Dein Wochenplan (~${formatCurrency(mealCosts.estimatedTotal)}) übersteigt das verbleibende „${foodCat.name}"-Budget (${formatCurrency(Math.max(0, remaining))}).`,
        tone: 'tip',
      })
    }
  }

  const goalsWithHabits = data.goals.filter(g => (g.linkedHabitIds?.length ?? 0) > 0)
  if (goalsWithHabits.length > 0) {
    const behind = goalsWithHabits.filter(g => {
      const ids = g.linkedHabitIds ?? []
      const todayDone = ids.filter(id =>
        data.habitCompletions.some(c => c.habitId === id && c.date === today),
      ).length
      return todayDone < ids.length
    }).length
    if (behind > 0) {
      insights.push({
        id: 'goal-habits',
        title: 'Ziele & Gewohnheiten',
        body: `${behind} Ziel${behind > 1 ? 'e' : ''} mit offenen verknüpften Gewohnheiten heute — ein Tipp bringt dich näher.`,
        tone: 'tip',
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: 'start',
      title: 'Mehr Daten, mehr Insights',
      body: 'Tracke ein paar Tage Gewohnheiten, Wellness und Budget – dann erkennst du Muster hier.',
      tone: 'neutral',
    })
  }

  return insights.slice(0, 4)
}