import type { AppData, User, UserSettings, WeeklyRitualState } from '../types'
import { migrateHabits } from './habits'
import { getWeekStart } from './sundayRitual'

/** Legacy-Präfix beibehalten — bestehende Nutzerdaten im Browser bleiben erhalten. */
const USERS_KEY = 'lifeorganizer_users'
const SESSION_KEY = 'lifeorganizer_session'
const DATA_PREFIX = 'lifeorganizer_data_'

export const defaultSettings = (): UserSettings => ({
  theme: 'dark',
  waterGoalMl: 2500,
  waterGlassMl: 250,
  onboardingCompleted: false,
  savingsIncrement: 10,
  pomodoroWorkMin: 25,
  pomodoroBreakMin: 5,
  dailyReminder: false,
  habitStreakReminder: true,
  habitEveningReminderHour: 20,
  groceryBookToBudget: true,
})

export const defaultAppData = (): AppData => ({
  settings: defaultSettings(),
  habits: [],
  habitCompletions: [],
  budgetCategories: [
    { id: '1', name: 'Miete', limit: 800, color: '#3b82f6' },
    { id: '2', name: 'Lebensmittel', limit: 400, color: '#10b981' },
    { id: '3', name: 'Transport', limit: 150, color: '#f59e0b' },
    { id: '4', name: 'Freizeit', limit: 200, color: '#8b5cf6' },
  ],
  transactions: [],
  recurringTransactions: [],
  savingsWeeks: Array.from({ length: 52 }, (_, i) => ({
    week: i + 1,
    amount: (i + 1) * 10,
    completed: false,
  })),
  mealPlan: [
    { day: 'Montag', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Dienstag', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Mittwoch', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Donnerstag', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Freitag', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Samstag', breakfast: '', lunch: '', dinner: '', snacks: '' },
    { day: 'Sonntag', breakfast: '', lunch: '', dinner: '', snacks: '' },
  ],
  groceryList: [],
  recipes: [],
  plannerTasks: [],
  plannerNotes: [],
  goals: [],
  waterEntries: [],
  moodEntries: [],
  sleepEntries: [],
  journalEntries: [],
  quickNotes: [],
  focusSessions: [],
  weeklyReviews: [],
  weeklyRitual: defaultWeeklyRitual(),
})

export function defaultWeeklyRitual(): WeeklyRitualState {
  return {
    weekStart: getWeekStart(),
    focusHabitIds: [],
    focusMode: 'full',
  }
}

function migrateData(parsed: Partial<AppData>): AppData {
  const defaults = defaultAppData()
  return {
    ...defaults,
    ...parsed,
    settings: { ...defaults.settings, ...parsed.settings, groceryBookToBudget: parsed.settings?.groceryBookToBudget ?? defaults.settings.groceryBookToBudget },
    habits: migrateHabits(parsed.habits ?? defaults.habits),
    waterEntries: parsed.waterEntries ?? [],
    moodEntries: parsed.moodEntries ?? [],
    sleepEntries: parsed.sleepEntries ?? [],
    journalEntries: parsed.journalEntries ?? [],
    quickNotes: parsed.quickNotes ?? [],
    focusSessions: parsed.focusSessions ?? [],
    weeklyReviews: parsed.weeklyReviews ?? [],
    recurringTransactions: parsed.recurringTransactions ?? [],
    recipes: parsed.recipes ?? [],
    weeklyRitual: parsed.weeklyRitual ?? defaultWeeklyRitual(),
    groceryLastTripTransactionId: parsed.groceryLastTripTransactionId,
    goals: (parsed.goals ?? []).map(g => ({
      ...g,
      linkedHabitIds: g.linkedHabitIds ?? [],
      habitDrivenProgress: g.habitDrivenProgress,
    })),
    savingsWeeks: (parsed.savingsWeeks ?? defaults.savingsWeeks).map(w => ({
      ...w,
      budgetTransactionId: w.budgetTransactionId,
    })),
  }
}

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId)
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getUserData(userId: string): AppData {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + userId)
    if (!raw) return defaultAppData()
    return migrateData(JSON.parse(raw))
  } catch {
    return defaultAppData()
  }
}

export function saveUserData(userId: string, data: AppData): void {
  localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data))
}

export function deleteUserData(userId: string): void {
  localStorage.removeItem(DATA_PREFIX + userId)
}

export function deleteUserAccount(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId)
  saveUsers(users)
  deleteUserData(userId)
  if (getSession() === userId) clearSession()
}

export function regenerateSavingsWeeks(increment: number): AppData['savingsWeeks'] {
  return Array.from({ length: 52 }, (_, i) => ({
    week: i + 1,
    amount: (i + 1) * increment,
    completed: false,
  }))
}