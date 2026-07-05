import type { HabitScheduleType } from '../types'

export const habitTemplates: Array<{
  name: string
  icon: string
  color: string
  schedule?: HabitScheduleType
  weekdays?: number[]
  timesPerWeek?: number
}> = [
  { name: '10 Min. Meditation', icon: '🧘', color: '#8b5cf6', schedule: 'daily' },
  { name: '2L Wasser trinken', icon: '💧', color: '#06b6d4', schedule: 'daily' },
  { name: '30 Min. Sport', icon: '💪', color: '#ef4444', schedule: 'weekdays', weekdays: [1, 3, 5] },
  { name: '20 Seiten lesen', icon: '📚', color: '#3b82f6', schedule: 'daily' },
  { name: 'Tagebuch schreiben', icon: '✍️', color: '#f59e0b', schedule: 'weekdays', weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { name: 'Kein Social Media', icon: '📵', color: '#ec4899', schedule: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
  { name: '8 Stunden schlafen', icon: '😴', color: '#6366f1', schedule: 'daily' },
  { name: 'Gesund essen', icon: '🥗', color: '#10b981', schedule: 'weekly', timesPerWeek: 5 },
]