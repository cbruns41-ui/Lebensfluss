import type { AppData, FocusMode, WeeklyRitualState } from '../types'
import { getMealPlanProgress } from './meals'
import { toDateKey } from './utils'

export const RITUAL_STEPS = [
  { id: 'review', title: 'Rückblick', subtitle: 'Deine Woche in Zahlen' },
  { id: 'habits', title: 'Fokus-Gewohnheiten', subtitle: 'Bis zu 3 Prioritäten' },
  { id: 'mode', title: 'Fokus-Woche', subtitle: 'Volle, leichte oder Basics-Woche' },
  { id: 'meal', title: 'Meal Prep', subtitle: 'Essen für die Woche planen' },
  { id: 'budget', title: 'Budget-Check', subtitle: 'Finanzen im Blick' },
] as const

export type RitualStepId = (typeof RITUAL_STEPS)[number]['id']

export function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return toDateKey(d)
}

export function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return toDateKey(d)
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00')
  const end = new Date(getWeekEnd(weekStart) + 'T12:00:00')
  const fmt = (dt: Date) =>
    dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function isRitualDue(ritual: WeeklyRitualState, date = new Date()): boolean {
  const currentWeek = getWeekStart(date)
  return ritual.weekStart !== currentWeek || !ritual.completedAt
}

export function getActiveRitual(data: AppData): WeeklyRitualState {
  const currentWeek = getWeekStart()
  if (data.weeklyRitual.weekStart !== currentWeek) {
    return {
      weekStart: currentWeek,
      focusHabitIds: [],
      focusMode: data.weeklyRitual.focusMode ?? 'full',
    }
  }
  return data.weeklyRitual
}

export function getActiveFocusMode(data: AppData): FocusMode {
  const ritual = getActiveRitual(data)
  if (!ritual.completedAt) return 'full'
  return ritual.focusMode
}

export function getMealRitualStatus(data: AppData): { percent: number; ready: boolean } {
  const { percent } = getMealPlanProgress(data.mealPlan)
  return { percent, ready: percent >= 50 }
}

export function getBudgetRitualStatus(data: AppData): { expenses: number; limit: number; ok: boolean } {
  const monthKey = toDateKey(new Date()).slice(0, 7)
  const expenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0)
  const limit = data.budgetCategories.reduce((s, c) => s + c.limit, 0)
  return { expenses, limit, ok: limit === 0 || expenses <= limit }
}

export function completeRitual(
  focusHabitIds: string[],
  focusMode: FocusMode,
): WeeklyRitualState {
  return {
    weekStart: getWeekStart(),
    completedAt: new Date().toISOString(),
    focusHabitIds,
    focusMode,
  }
}