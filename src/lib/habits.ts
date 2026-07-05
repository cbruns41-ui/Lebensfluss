import type { Habit, HabitCompletion } from '../types'
import { toDateKey } from './utils'

export type HabitScheduleType = 'daily' | 'weekdays' | 'weekly'

export const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const
export const WEEKDAY_LABELS_MON_FIRST = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const
export const WEEKDAY_VALUES_MON_FIRST = [1, 2, 3, 4, 5, 6, 0] as const

export function defaultHabitFields(): Pick<Habit, 'schedule' | 'weekdays' | 'timesPerWeek' | 'reminder'> {
  return {
    schedule: 'daily',
    weekdays: [1, 2, 3, 4, 5],
    timesPerWeek: 3,
    reminder: { enabled: false, time: '09:00' },
  }
}

export function migrateHabit(habit: Habit): Habit {
  const defaults = defaultHabitFields()
  return {
    ...habit,
    schedule: habit.schedule ?? defaults.schedule,
    weekdays: habit.weekdays?.length ? habit.weekdays : defaults.weekdays,
    timesPerWeek: habit.timesPerWeek ?? defaults.timesPerWeek,
    reminder: habit.reminder ?? defaults.reminder,
  }
}

export function migrateHabits(habits: Habit[]): Habit[] {
  return habits.map(migrateHabit)
}

function parseDate(input: Date | string): Date {
  return typeof input === 'string' ? new Date(input + 'T12:00:00') : input
}

export function isCompleted(habitId: string, date: string, completions: HabitCompletion[]): boolean {
  return completions.some(c => c.habitId === habitId && c.date === date)
}

/** Montag als Wochenstart (DE). */
export function getWeekStartKey(date: Date | string): string {
  const d = parseDate(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateKey(d)
}

export function getWeekDates(anchor: Date | string): string[] {
  const start = parseDate(getWeekStartKey(anchor))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return toDateKey(d)
  })
}

export function getWeeklyCompletionCount(
  habitId: string,
  anchor: Date | string,
  completions: HabitCompletion[],
): number {
  const week = new Set(getWeekDates(anchor))
  return completions.filter(c => c.habitId === habitId && week.has(c.date)).length
}

export function isHabitDueOnDate(habit: Habit, date: Date | string): boolean {
  const h = migrateHabit(habit)
  const d = parseDate(date)

  switch (h.schedule) {
    case 'daily':
      return true
    case 'weekdays':
      return (h.weekdays ?? []).includes(d.getDay())
    case 'weekly':
      return true
    default:
      return true
  }
}

export function isWeeklyTargetMet(
  habit: Habit,
  anchor: Date | string,
  completions: HabitCompletion[],
): boolean {
  const h = migrateHabit(habit)
  const target = h.timesPerWeek ?? 3
  return getWeeklyCompletionCount(h.id, anchor, completions) >= target
}

/** Streak über fällige Tage (daily/weekdays) bzw. Wochen (weekly). */
export function getHabitStreak(habit: Habit, completions: HabitCompletion[], anchor = new Date()): number {
  const h = migrateHabit(habit)

  if (h.schedule === 'weekly') {
    let streak = 0
    const d = parseDate(anchor)
    for (let i = 0; i < 52; i++) {
      if (isWeeklyTargetMet(h, d, completions)) streak++
      else break
      d.setDate(d.getDate() - 7)
    }
    return streak
  }

  let streak = 0
  const d = parseDate(anchor)
  for (let i = 0; i < 365; i++) {
    if (isHabitDueOnDate(h, d)) {
      if (isCompleted(h.id, toDateKey(d), completions)) streak++
      else break
    }
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getTodayDueHabits(
  habits: Habit[],
  completions: HabitCompletion[],
  anchor = new Date(),
): Habit[] {
  const todayKey = toDateKey(anchor)
  return migrateHabits(habits).filter(h => {
    if (!isHabitDueOnDate(h, anchor)) return false
    if (h.schedule === 'weekly') {
      return !isWeeklyTargetMet(h, anchor, completions) || !isCompleted(h.id, todayKey, completions)
    }
    return true
  })
}

export function getTodayPendingHabits(
  habits: Habit[],
  completions: HabitCompletion[],
  anchor = new Date(),
): Habit[] {
  const todayKey = toDateKey(anchor)
  return getTodayDueHabits(habits, completions, anchor).filter(h => {
    if (h.schedule === 'weekly') {
      const count = getWeeklyCompletionCount(h.id, anchor, completions)
      const target = h.timesPerWeek ?? 3
      return count < target && !isCompleted(h.id, todayKey, completions)
    }
    return !isCompleted(h.id, todayKey, completions)
  })
}

export function getTodayHabitProgress(
  habits: Habit[],
  completions: HabitCompletion[],
  anchor = new Date(),
): { done: number; total: number } {
  const todayKey = toDateKey(anchor)
  const migrated = migrateHabits(habits)
  let total = 0
  let done = 0

  for (const h of migrated) {
    if (!isHabitDueOnDate(h, anchor)) continue
    if (h.schedule === 'weekly') {
      const count = getWeeklyCompletionCount(h.id, anchor, completions)
      const target = h.timesPerWeek ?? 3
      total += 1
      if (count >= target || isCompleted(h.id, todayKey, completions)) done += 1
    } else {
      total += 1
      if (isCompleted(h.id, todayKey, completions)) done += 1
    }
  }

  return { done, total }
}

export function formatScheduleLabel(habit: Habit): string {
  const h = migrateHabit(habit)
  switch (h.schedule) {
    case 'daily':
      return 'Täglich'
    case 'weekdays': {
      const days = (h.weekdays ?? []).sort((a, b) => {
        const order = (d: number) => d === 0 ? 7 : d
        return order(a) - order(b)
      })
      if (days.length === 7) return 'Täglich'
      if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Mo–Fr'
      return days.map(d => WEEKDAY_LABELS[d]).join(', ')
    }
    case 'weekly':
      return `${h.timesPerWeek ?? 3}× pro Woche`
    default:
      return 'Täglich'
  }
}

export function formatReminderLabel(habit: Habit): string | null {
  const r = migrateHabit(habit).reminder
  if (!r?.enabled) return null
  return r.time
}