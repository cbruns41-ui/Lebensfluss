import type { AppData } from '../types'
import { getActiveFocusMode, getActiveRitual } from './sundayRitual'
import { getLifeScoreWeights, getHabitsForScoring } from './focusMode'
import { getTodayHabitProgress } from './habits'
import { toDateKey } from './utils'

export interface LifeScoreBreakdown {
  total: number
  habits: number
  wellness: number
  budget: number
  focus: number
  reflection: number
  label: string
}

function scoreForDate(data: AppData, dateKey: string, weights = getLifeScoreWeights(getActiveFocusMode(data))): Omit<LifeScoreBreakdown, 'label'> {
  const d = new Date(dateKey + 'T12:00:00')
  const monthKey = dateKey.slice(0, 7)
  const ritual = getActiveRitual(data)
  const mode = getActiveFocusMode(data)
  const scoringHabits = getHabitsForScoring(
    data.habits,
    ritual.focusHabitIds ?? [],
    mode,
    !!ritual.completedAt,
  )

  const { done, total: habitTotal } = getTodayHabitProgress(scoringHabits, data.habitCompletions, d)
  const habits = habitTotal > 0 ? Math.round((done / habitTotal) * 100) : (scoringHabits.length === 0 ? 50 : 0)

  const water = data.waterEntries.find(w => w.date === dateKey)?.ml ?? 0
  const waterPct = Math.min(100, (water / data.settings.waterGoalMl) * 100)
  const mood = data.moodEntries.find(m => m.date === dateKey)?.mood
  const moodPct = mood ? (mood / 5) * 100 : 50
  const sleep = data.sleepEntries.find(s => s.date === dateKey)
  const sleepPct = sleep ? Math.min(100, (sleep.hours / 8) * 100) : 50
  const wellness = Math.round((waterPct + moodPct + sleepPct) / 3)

  const monthExpenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0)
  const monthBudget = data.budgetCategories.reduce((s, c) => s + c.limit, 0)
  let budget = 75
  if (monthBudget > 0) {
    const ratio = monthExpenses / monthBudget
    budget = ratio <= 1 ? Math.round(100 - ratio * 30) : Math.max(0, Math.round(70 - (ratio - 1) * 50))
  }

  const focusMin = data.focusSessions
    .filter(s => s.type === 'work' && s.date === dateKey)
    .reduce((s, f) => s + f.durationMin, 0)
  const focusGoal = data.settings.pomodoroWorkMin * 2
  const focus = Math.min(100, Math.round((focusMin / focusGoal) * 100))

  const hasJournal = data.journalEntries.some(e => e.date === dateKey)
  const hasGratitude = data.journalEntries.some(e => e.date === dateKey && e.type === 'gratitude')
  const reflection = hasJournal && hasGratitude ? 100 : hasJournal || hasGratitude ? 70 : 30

  const total = Math.round(
    habits * weights.habits
    + wellness * weights.wellness
    + budget * weights.budget
    + focus * weights.focus
    + reflection * weights.reflection,
  )

  return { total, habits, wellness, budget, focus, reflection }
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Hervorragend'
  if (score >= 75) return 'Stark'
  if (score >= 60) return 'Gut'
  if (score >= 40) return 'Ausbaufähig'
  return 'Neustart'
}

export function computeLifeScore(data: AppData, date = new Date()): LifeScoreBreakdown {
  const scores = scoreForDate(data, toDateKey(date))
  return { ...scores, label: getScoreLabel(scores.total) }
}

export function getLifeScoreForDate(data: AppData, dateKey: string): number {
  return scoreForDate(data, dateKey).total
}

export function getLifeScoreHistory(data: AppData, days = 7): { date: string; score: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const key = toDateKey(d)
    return { date: key, score: scoreForDate(data, key).total }
  })
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}