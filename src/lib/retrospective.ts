import type { AppData } from '../types'
import { formatMonthYear, getDaysInMonth, toDateKey } from './utils'
import { migrateHabits, isHabitDueOnDate, getWeekStartKey } from './habits'

export interface MonthSummary {
  monthKey: string
  label: string
  daysInMonth: number
  habits: {
    completionRate: number
    totalCompletions: number
    bestHabit: { name: string; icon: string; rate: number } | null
  }
  water: {
    daysGoalReached: number
    daysTracked: number
    totalMl: number
  }
  budget: {
    income: number
    expenses: number
    balance: number
    topCategory: { name: string; amount: number; color: string } | null
  }
  wellness: {
    avgMood: number
    moodDays: number
    avgSleepHours: number
    sleepDays: number
  }
  focus: { totalMinutes: number; sessions: number }
  journal: { total: number; gratitude: number }
  reviews: number
}

export interface YearMonthTile {
  month: number
  label: string
  habitRate: number
  expenses: number
  focusMin: number
  moodAvg: number
}

export interface YearSummary {
  year: number
  months: YearMonthTile[]
  totals: {
    habitRate: number
    expenses: number
    income: number
    focusMin: number
    waterGoalDays: number
    journalEntries: number
    avgMood: number
  }
  highlights: {
    bestHabitMonth: { label: string; rate: number } | null
    highestExpenseMonth: { label: string; amount: number } | null
    mostFocusMonth: { label: string; minutes: number } | null
    bestMoodMonth: { label: string; mood: number } | null
  }
}

function monthDates(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month)
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return toDateKey(d)
  })
}

function isInMonth(dateStr: string, monthKey: string): boolean {
  return dateStr.startsWith(monthKey)
}

export function computeMonthSummary(data: AppData, year: number, month: number): MonthSummary {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const days = monthDates(year, month)
  const daysInMonth = days.length
  const label = formatMonthYear(new Date(year, month, 1))

  const completionsInMonth = data.habitCompletions.filter(c => isInMonth(c.date, monthKey))
  const habits = migrateHabits(data.habits)

  const habitMonthRate = (h: (typeof habits)[number]) => {
    if (h.schedule === 'weekly') {
      const weeks = [...new Set(days.map(d => getWeekStartKey(d)))]
      const target = weeks.length * (h.timesPerWeek ?? 3)
      const done = completionsInMonth.filter(c => c.habitId === h.id).length
      return target > 0 ? Math.round((Math.min(done, target) / target) * 100) : 0
    }
    const dueDays = days.filter(d => isHabitDueOnDate(h, d))
    const done = dueDays.filter(d =>
      completionsInMonth.some(c => c.habitId === h.id && c.date === d),
    ).length
    return dueDays.length > 0 ? Math.round((done / dueDays.length) * 100) : 0
  }

  const totalPossible = habits.reduce((sum, h) => {
    if (h.schedule === 'weekly') {
      const weeks = [...new Set(days.map(d => getWeekStartKey(d)))]
      return sum + weeks.length * (h.timesPerWeek ?? 3)
    }
    return sum + days.filter(d => isHabitDueOnDate(h, d)).length
  }, 0)
  const completionRate = totalPossible > 0
    ? Math.round((completionsInMonth.length / totalPossible) * 100)
    : 0

  let bestHabit: MonthSummary['habits']['bestHabit'] = null
  if (habits.length > 0) {
    const ranked = habits.map(h => ({
      name: h.name,
      icon: h.icon,
      rate: habitMonthRate(h),
    })).sort((a, b) => b.rate - a.rate)
    if (ranked[0]) bestHabit = ranked[0]
  }

  const waterInMonth = data.waterEntries.filter(w => isInMonth(w.date, monthKey))
  const waterGoal = data.settings.waterGoalMl

  const monthTx = data.transactions.filter(t => isInMonth(t.date, monthKey))
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  const catTotals = data.budgetCategories.map(cat => ({
    name: cat.name,
    color: cat.color,
    amount: monthTx.filter(t => t.categoryId === cat.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount)

  const moods = data.moodEntries.filter(m => isInMonth(m.date, monthKey))
  const sleeps = data.sleepEntries.filter(s => isInMonth(s.date, monthKey))
  const focus = data.focusSessions.filter(f => f.type === 'work' && isInMonth(f.date, monthKey))
  const journals = data.journalEntries.filter(j => isInMonth(j.date, monthKey))

  return {
    monthKey,
    label,
    daysInMonth,
    habits: {
      completionRate,
      totalCompletions: completionsInMonth.length,
      bestHabit,
    },
    water: {
      daysGoalReached: waterInMonth.filter(w => w.ml >= waterGoal).length,
      daysTracked: waterInMonth.length,
      totalMl: waterInMonth.reduce((s, w) => s + w.ml, 0),
    },
    budget: {
      income,
      expenses,
      balance: income - expenses,
      topCategory: catTotals[0] ?? null,
    },
    wellness: {
      avgMood: moods.length > 0 ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0,
      moodDays: moods.length,
      avgSleepHours: sleeps.length > 0 ? sleeps.reduce((s, sl) => s + sl.hours, 0) / sleeps.length : 0,
      sleepDays: sleeps.length,
    },
    focus: {
      totalMinutes: focus.reduce((s, f) => s + f.durationMin, 0),
      sessions: focus.length,
    },
    journal: {
      total: journals.length,
      gratitude: journals.filter(j => j.type === 'gratitude').length,
    },
    reviews: data.weeklyReviews.filter(r => isInMonth(r.weekStart, monthKey)).length,
  }
}

export function computeYearSummary(data: AppData, year: number): YearSummary {
  const months: YearMonthTile[] = []
  let totalExpenses = 0
  let totalIncome = 0
  let totalFocus = 0
  let totalWaterGoalDays = 0
  let totalJournal = 0
  let habitRates: number[] = []
  let moodAvgs: number[] = []

  for (let m = 0; m < 12; m++) {
    const summary = computeMonthSummary(data, year, m)
    months.push({
      month: m,
      label: new Date(year, m, 1).toLocaleDateString('de-DE', { month: 'short' }),
      habitRate: summary.habits.completionRate,
      expenses: summary.budget.expenses,
      focusMin: summary.focus.totalMinutes,
      moodAvg: summary.wellness.avgMood,
    })
    totalExpenses += summary.budget.expenses
    totalIncome += summary.budget.income
    totalFocus += summary.focus.totalMinutes
    totalWaterGoalDays += summary.water.daysGoalReached
    totalJournal += summary.journal.total
    if (data.habits.length > 0) habitRates.push(summary.habits.completionRate)
    if (summary.wellness.avgMood > 0) moodAvgs.push(summary.wellness.avgMood)
  }

  const bestHabitMonth = months.reduce<{ label: string; rate: number } | null>((best, tile, i) => {
    if (tile.habitRate === 0) return best
    if (!best || tile.habitRate > best.rate) {
      return { label: formatMonthYear(new Date(year, i, 1)), rate: tile.habitRate }
    }
    return best
  }, null)

  const highestExpenseMonth = months.reduce<{ label: string; amount: number } | null>((best, tile, i) => {
    if (tile.expenses === 0) return best
    if (!best || tile.expenses > best.amount) {
      return { label: formatMonthYear(new Date(year, i, 1)), amount: tile.expenses }
    }
    return best
  }, null)

  const mostFocusMonth = months.reduce<{ label: string; minutes: number } | null>((best, tile, i) => {
    if (tile.focusMin === 0) return best
    if (!best || tile.focusMin > best.minutes) {
      return { label: formatMonthYear(new Date(year, i, 1)), minutes: tile.focusMin }
    }
    return best
  }, null)

  const bestMoodMonth = months.reduce<{ label: string; mood: number } | null>((best, tile, i) => {
    if (tile.moodAvg === 0) return best
    if (!best || tile.moodAvg > best.mood) {
      return { label: formatMonthYear(new Date(year, i, 1)), mood: tile.moodAvg }
    }
    return best
  }, null)

  return {
    year,
    months,
    totals: {
      habitRate: habitRates.length > 0 ? Math.round(habitRates.reduce((a, b) => a + b, 0) / habitRates.length) : 0,
      expenses: totalExpenses,
      income: totalIncome,
      focusMin: totalFocus,
      waterGoalDays: totalWaterGoalDays,
      journalEntries: totalJournal,
      avgMood: moodAvgs.length > 0 ? moodAvgs.reduce((a, b) => a + b, 0) / moodAvgs.length : 0,
    },
    highlights: {
      bestHabitMonth,
      highestExpenseMonth,
      mostFocusMonth,
      bestMoodMonth,
    },
  }
}