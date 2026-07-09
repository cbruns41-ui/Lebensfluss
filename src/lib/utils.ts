export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Lokales Kalenderdatum (YYYY-MM-DD) — nicht UTC, wichtig für DE-Zeitzonen. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getCurrentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getWeekDays(): string[] {
  return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
}

export function getFullWeekDays(): string[] {
  return ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const HABIT_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
]

export const HABIT_ICONS = ['✨', '💪', '📚', '🧘', '💧', '🏃', '🎯', '😴', '🥗', '✍️']

export const GROCERY_CATEGORIES = [
  'Obst & Gemüse', 'Fleisch & Fisch', 'Milchprodukte', 'Backwaren', 'Getränke', 'Sonstiges',
]