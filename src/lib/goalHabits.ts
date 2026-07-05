import type { AppData, Goal, HabitCompletion } from '../types'
import { getHabitStreak, migrateHabits, getWeeklyCompletionCount } from './habits'
import { toDateKey } from './utils'

export interface LinkedHabitStats {
  completions30d: number
  completionsThisWeek: number
  bestStreak: number
  todayDone: number
  todayTotal: number
}

export function countLinkedCompletions(
  habitIds: string[],
  completions: HabitCompletion[],
  sinceDate?: string,
): number {
  return completions.filter(c => {
    if (!habitIds.includes(c.habitId)) return false
    if (sinceDate && c.date < sinceDate) return false
    return true
  }).length
}

export function getLinkedHabitStats(goal: Goal, data: AppData): LinkedHabitStats | null {
  const ids = goal.linkedHabitIds ?? []
  if (ids.length === 0) return null

  const habits = migrateHabits(data.habits).filter(h => ids.includes(h.id))
  if (habits.length === 0) return null

  const today = toDateKey(new Date())
  const since30 = toDateKey(new Date(Date.now() - 30 * 86400000))

  return {
    completions30d: countLinkedCompletions(ids, data.habitCompletions, since30),
    completionsThisWeek: ids.reduce(
      (s, id) => s + getWeeklyCompletionCount(id, new Date(), data.habitCompletions),
      0,
    ),
    bestStreak: Math.max(0, ...habits.map(h => getHabitStreak(h, data.habitCompletions))),
    todayDone: ids.filter(id =>
      data.habitCompletions.some(c => c.habitId === id && c.date === today),
    ).length,
    todayTotal: ids.length,
  }
}

export function computeHabitDrivenCurrent(goal: Goal, data: AppData): number {
  const ids = goal.linkedHabitIds ?? []
  if (ids.length === 0) return goal.current

  const since30 = toDateKey(new Date(Date.now() - 30 * 86400000))
  const count = countLinkedCompletions(ids, data.habitCompletions, since30)
  return Math.min(goal.target, count)
}

export function applyHabitDrivenGoals(data: AppData): AppData {
  const goals = data.goals.map(g => {
    if (!g.habitDrivenProgress || !(g.linkedHabitIds?.length)) return g
    return { ...g, current: computeHabitDrivenCurrent(g, data) }
  })
  const changed = goals.some((g, i) => g.current !== data.goals[i]?.current)
  return changed ? { ...data, goals } : data
}