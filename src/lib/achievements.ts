import type { AppData, Achievement } from '../types'
import { toDateKey } from './utils'
import { getHabitStreak, migrateHabits } from './habits'
import { computeLifeScore, getLifeScoreHistory } from './lifeScore'
import { getWeekStart } from './sundayRitual'

export function computeAchievements(data: AppData): Achievement[] {
  const today = toDateKey(new Date())
  const habitStreaks = migrateHabits(data.habits).map(h =>
    getHabitStreak(h, data.habitCompletions),
  )
  const maxStreak = Math.max(0, ...habitStreaks)
  const savingsDone = data.savingsWeeks.filter(w => w.completed).length
  const focusTotal = data.focusSessions.filter(s => s.type === 'work').reduce((s, f) => s + f.durationMin, 0)
  const gratitudeCount = data.journalEntries.filter(e => e.type === 'gratitude').length
  const goalsDone = data.goals.filter(g => g.current >= g.target).length
  const waterToday = data.waterEntries.find(w => w.date === today)?.ml ?? 0
  const lifeScore = computeLifeScore(data)
  const avgLifeScore = Math.round(
    getLifeScoreHistory(data, 7).reduce((s, h) => s + h.score, 0) / 7,
  )

  return [
    {
      id: 'life_score_75',
      title: 'Life Balance',
      description: 'Life Score von 75+ erreicht',
      icon: '✨',
      unlocked: lifeScore.total >= 75,
      progress: lifeScore.total,
      target: 75,
    },
    {
      id: 'life_score_week',
      title: 'Woche im Flow',
      description: '7-Tage-Ø Life Score über 70',
      icon: '🌟',
      unlocked: avgLifeScore >= 70,
      progress: avgLifeScore,
      target: 70,
    },
    {
      id: 'first_habit',
      title: 'Erste Schritte',
      description: 'Erste Gewohnheit erstellt',
      icon: '🎯',
      unlocked: data.habits.length >= 1,
    },
    {
      id: 'streak_7',
      title: 'Woche der Disziplin',
      description: '7-Tage-Streak bei einer Gewohnheit',
      icon: '🔥',
      unlocked: maxStreak >= 7,
      progress: Math.min(maxStreak, 7),
      target: 7,
    },
    {
      id: 'streak_30',
      title: 'Monatsmeister',
      description: '30-Tage-Streak bei einer Gewohnheit',
      icon: '👑',
      unlocked: maxStreak >= 30,
      progress: Math.min(maxStreak, 30),
      target: 30,
    },
    {
      id: 'budget_10',
      title: 'Budget-Starter',
      description: '10 Budget-Einträge erfasst',
      icon: '💰',
      unlocked: data.transactions.length >= 10,
      progress: Math.min(data.transactions.length, 10),
      target: 10,
    },
    {
      id: 'savings_10',
      title: 'Sparfuchs',
      description: '10 Wochen der Spar-Challenge geschafft',
      icon: '🐷',
      unlocked: savingsDone >= 10,
      progress: Math.min(savingsDone, 10),
      target: 10,
    },
    {
      id: 'savings_complete',
      title: 'Spar-Legende',
      description: '52-Wochen-Challenge abgeschlossen',
      icon: '🏆',
      unlocked: savingsDone >= 52,
      progress: savingsDone,
      target: 52,
    },
    {
      id: 'water_goal',
      title: 'Hydration Held',
      description: 'Tägliches Wasserziel erreicht',
      icon: '💧',
      unlocked: waterToday >= data.settings.waterGoalMl,
      progress: waterToday,
      target: data.settings.waterGoalMl,
    },
    {
      id: 'focus_60',
      title: 'Fokus-Stunde',
      description: '60 Minuten Fokuszeit gesammelt',
      icon: '⏱️',
      unlocked: focusTotal >= 60,
      progress: Math.min(focusTotal, 60),
      target: 60,
    },
    {
      id: 'gratitude_7',
      title: 'Dankbarkeit',
      description: '7 Dankbarkeits-Einträge geschrieben',
      icon: '🙏',
      unlocked: gratitudeCount >= 7,
      progress: Math.min(gratitudeCount, 7),
      target: 7,
    },
    {
      id: 'goal_done',
      title: 'Ziel erreicht',
      description: 'Ein persönliches Ziel vollendet',
      icon: '🎉',
      unlocked: goalsDone >= 1,
    },
    {
      id: 'meal_prep',
      title: 'Meal Prep Pro',
      description: 'Komplette Woche geplant',
      icon: '🍱',
      unlocked: data.mealPlan.every(d => d.breakfast || d.lunch || d.dinner),
    },
    {
      id: 'recipe_book',
      title: 'Rezept-Sammler',
      description: '5 Rezepte im Rezeptbuch',
      icon: '📖',
      unlocked: data.recipes.length >= 5,
      progress: Math.min(data.recipes.length, 5),
      target: 5,
    },
    {
      id: 'sunday_ritual',
      title: 'Wochenstarter',
      description: 'Sonntags-Ritual abgeschlossen',
      icon: '☀️',
      unlocked: !!data.weeklyRitual.completedAt
        && data.weeklyRitual.weekStart === getWeekStart(),
    },
    {
      id: 'goal_habits',
      title: 'Ziel-Verknüpfer',
      description: 'Gewohnheit mit einem Ziel verknüpft',
      icon: '🔗',
      unlocked: data.goals.some(g => (g.linkedHabitIds?.length ?? 0) > 0),
    },
    {
      id: 'planner_20',
      title: 'Planungs-Profi',
      description: '20 Planer-Aufgaben erledigt',
      icon: '📋',
      unlocked: data.plannerTasks.filter(t => t.completed).length >= 20,
      progress: Math.min(data.plannerTasks.filter(t => t.completed).length, 20),
      target: 20,
    },
  ]
}