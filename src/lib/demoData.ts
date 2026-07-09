import type { AppData } from '../types'
import { defaultAppData } from './storage'
import { toDateKey } from './utils'
import { mealWeekTemplates } from './mealWeekTemplates'
import { createStarterRecipes } from './recipes'

export const DEMO_EMAIL = 'demo@lifeorganizer.local'
export const DEMO_USER_ID = 'demo-user-lifeorganizer'

export function createDemoAppData(): AppData {
  const base = defaultAppData()
  const today = toDateKey(new Date())

  return {
    ...base,
    settings: { ...base.settings, onboardingCompleted: true },
    habits: [
      { id: 'h1', name: '10 Min. Meditation', icon: '🧘', color: '#8b5cf6', createdAt: today, schedule: 'daily', reminder: { enabled: true, time: '07:30' } },
      { id: 'h2', name: '2L Wasser trinken', icon: '💧', color: '#06b6d4', createdAt: today, schedule: 'daily', reminder: { enabled: true, time: '12:00' } },
      { id: 'h3', name: '30 Min. Sport', icon: '💪', color: '#ef4444', createdAt: today, schedule: 'weekdays', weekdays: [1, 3, 5], reminder: { enabled: false, time: '18:00' } },
    ],
    habitCompletions: [
      { habitId: 'h1', date: today },
      { habitId: 'h2', date: today },
    ],
    budgetCategories: [
      ...base.budgetCategories,
      { id: '5', name: 'Einkommen', limit: 0, color: '#22c55e' },
    ],
    transactions: [
      { id: 't1', categoryId: '2', amount: 45.50, note: 'Wocheneinkauf', date: today, type: 'expense' },
      { id: 't2', categoryId: '3', amount: 12.00, note: 'Bus-Ticket', date: today, type: 'expense' },
      { id: 't3', categoryId: '5', amount: 2500, note: 'Gehalt', date: today, type: 'income' },
    ],
    recurringTransactions: [
      { id: 'r1', name: 'Miete', categoryId: '1', amount: 800, note: 'Warmmiete', type: 'expense', dayOfMonth: 1, active: true },
      { id: 'r2', name: 'Gehalt', categoryId: '5', amount: 2500, note: 'Monatsgehalt', type: 'income', dayOfMonth: 25, active: true },
    ],
    savingsWeeks: base.savingsWeeks.map((w, i) => ({ ...w, completed: i < 3 })),
    mealPlan: mealWeekTemplates[0].plan.map((d, i) => ({
      ...base.mealPlan[i],
      ...d,
      day: base.mealPlan[i]?.day ?? d.day,
    })),
    recipes: createStarterRecipes(),
    groceryList: [
      { id: 'g1', name: 'Haferflocken', quantity: '500g', checked: false, category: 'Backwaren' },
      { id: 'g2', name: 'Banane', quantity: '6 Stk', checked: true, category: 'Obst & Gemüse' },
      { id: 'g3', name: 'Hähnchenbrust', quantity: '400g', checked: false, category: 'Fleisch & Fisch' },
    ],
    plannerTasks: [
      { id: 'p1', title: 'Steuererklärung vorbereiten', completed: false, priority: 'high', week: 1 },
      { id: 'p2', title: 'Wocheneinkauf planen', completed: true, priority: 'medium', week: 1 },
      { id: 'p3', title: 'Sport-Plan erstellen', completed: false, priority: 'low', week: 2 },
    ],
    goals: [
      { id: 'go1', title: '5 kg abnehmen', target: 5, current: 2, unit: 'kg', deadline: '2026-12-31' },
    ],
    waterEntries: [{ date: today, ml: 1500 }],
    moodEntries: [{ id: 'm1', date: today, mood: 4, note: '' }],
    journalEntries: [
      { id: 'j1', date: today, content: 'Heute war ein produktiver Tag!', type: 'journal' },
      { id: 'j2', date: today, content: 'Dankbar für meine Gesundheit und Familie.', type: 'gratitude' },
    ],
    quickNotes: [
      { id: 'n1', content: 'Milch nicht vergessen!', createdAt: new Date().toISOString(), pinned: true },
    ],
  }
}