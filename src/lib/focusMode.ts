import type { FocusMode, Habit } from '../types'
import { migrateHabits } from './habits'

export const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  full: 'Volle Woche',
  light: 'Leichte Woche',
  basics: 'Nur Basics',
}

export const FOCUS_MODE_DESCRIPTIONS: Record<FocusMode, string> = {
  full: 'Alle Module sichtbar – dein normaler Modus mit vollem Überblick.',
  light: 'Reduziertes Dashboard: Kernbereiche im Fokus, weniger Ablenkung.',
  basics: 'Minimal: Gewohnheiten, Wellness, Budget und Einkauf – für volle oder stressige Wochen.',
}

export const FOCUS_MODE_ICONS: Record<FocusMode, string> = {
  full: '🚀',
  light: '🌿',
  basics: '🎯',
}

export interface LifeScoreWeights {
  habits: number
  wellness: number
  budget: number
  focus: number
  reflection: number
}

const WEIGHTS: Record<FocusMode, LifeScoreWeights> = {
  full: { habits: 0.30, wellness: 0.25, budget: 0.15, focus: 0.15, reflection: 0.15 },
  light: { habits: 0.35, wellness: 0.30, budget: 0.20, focus: 0.10, reflection: 0.05 },
  basics: { habits: 0.40, wellness: 0.35, budget: 0.25, focus: 0, reflection: 0 },
}

export function getLifeScoreWeights(mode: FocusMode): LifeScoreWeights {
  return WEIGHTS[mode]
}

/** Dashboard quick-link paths hidden per focus mode */
const HIDDEN_PATHS: Record<FocusMode, string[]> = {
  full: [],
  light: ['/app/rueckblick', '/app/planer', '/app/spar-challenge'],
  basics: [
    '/app/fokus',
    '/app/essen',
    '/app/spar-challenge',
    '/app/planer',
    '/app/ziele',
    '/app/rueckblick',
  ],
}

const ALWAYS_VISIBLE: string[] = ['/app/einkauf', '/app/gewohnheiten', '/app/wellness', '/app/finanzen']

export function isQuickLinkVisible(path: string, mode: FocusMode): boolean {
  if (mode === 'full') return true
  if (mode === 'basics' && ALWAYS_VISIBLE.includes(path)) return true
  return !HIDDEN_PATHS[mode].includes(path)
}

export function filterQuickLinks<T extends { to: string }>(links: T[], mode: FocusMode): T[] {
  return links.filter(l => isQuickLinkVisible(l.to, mode))
}

const ALWAYS_ACCESSIBLE = ['/app', '/app/einstellungen', '/app/statistik', '/app/wochenreview', '/app/wochenritual', '/app/erfolge', '/app/tagebuch']

/** App-Routen, die in der Fokus-Woche ausgeblendet werden */
export function isAppPathVisible(path: string, mode: FocusMode): boolean {
  if (mode === 'full') return true
  if (ALWAYS_ACCESSIBLE.includes(path)) return true
  if (mode === 'basics' && ALWAYS_VISIBLE.includes(path)) return true
  return !HIDDEN_PATHS[mode].includes(path)
}

export function filterNavItems<T extends { to: string }>(items: T[], mode: FocusMode): T[] {
  return items.filter(i => isAppPathVisible(i.to, mode))
}

/** Bottom-Nav-Tabs pro Fokus-Modus */
const BOTTOM_NAV_HIDDEN: Record<FocusMode, string[]> = {
  full: [],
  light: [],
  basics: ['/app/essen'],
}

export function isBottomNavVisible(path: string, mode: FocusMode): boolean {
  return !BOTTOM_NAV_HIDDEN[mode].includes(path)
}

/**
 * Gewohnheiten für Fokus-Woche: Basics = nur Prioritäten, Light = Prioritäten zuerst.
 */
export function filterHabitsForFocusWeek(
  habits: Habit[],
  focusHabitIds: string[],
  mode: FocusMode,
  ritualCompleted: boolean,
): Habit[] {
  const migrated = migrateHabits(habits)
  if (!ritualCompleted || mode === 'full' || focusHabitIds.length === 0) return migrated

  const focused = migrated.filter(h => focusHabitIds.includes(h.id))
  if (focused.length === 0) return migrated

  if (mode === 'basics') return focused

  const rest = migrated.filter(h => !focusHabitIds.includes(h.id))
  return [...focused, ...rest]
}

/** Life Score & Statistik: in Light/Basics nur Prioritäts-Gewohnheiten zählen */
export function getHabitsForScoring(
  habits: Habit[],
  focusHabitIds: string[],
  mode: FocusMode,
  ritualCompleted: boolean,
): Habit[] {
  if (!ritualCompleted || mode === 'full' || focusHabitIds.length === 0) return habits
  const focused = habits.filter(h => focusHabitIds.includes(h.id))
  if (focused.length === 0) return habits
  if (mode === 'basics' || mode === 'light') return focused
  return habits
}