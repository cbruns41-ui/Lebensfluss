import type { AppData, WeeklyReview } from '../types'
import { computeLifeScore, getLifeScoreHistory } from './lifeScore'
import { getTodayHabitProgress } from './habits'
import { formatCurrency, toDateKey } from './utils'
import { buildWeeklyLifeScoreReport } from './lifeScoreReport'
import { computeWeeklyMealCosts } from './mealBudget'
import { getGroceryStats } from './meals'
import { formatWeekRange, getWeekStart } from './sundayRitual'

export function buildWeeklyStatsSummary(data: AppData): string {
  const score = computeLifeScore(data)
  const history = getLifeScoreHistory(data, 7)
  const avgScore = Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)

  let habitDays = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const { done, total } = getTodayHabitProgress(data.habits, data.habitCompletions, d)
    if (total > 0 && done === total) habitDays++
  }

  const monthKey = toDateKey(new Date()).slice(0, 7)
  const expenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return toDateKey(d)
  })
  const focusMin = data.focusSessions
    .filter(s => s.type === 'work' && weekDates.includes(s.date))
    .reduce((s, f) => s + f.durationMin, 0)

  const mealCosts = computeWeeklyMealCosts(data.mealPlan, data.recipes)
  const grocery = getGroceryStats(data.groceryList)
  const goalsLinked = data.goals.filter(g => (g.linkedHabitIds?.length ?? 0) > 0).length

  const lines = [
    `Life Score heute: ${score.total} (${score.label}), Ø 7 Tage: ${avgScore}`,
    `  Gewohnh. ${score.habits}% · Wellness ${score.wellness}% · Budget ${score.budget}% · Fokus ${score.focus}% · Reflexion ${score.reflection}%`,
    `Gewohnheiten: ${habitDays}/7 perfekte Tage`,
    `Budget Monat: ${formatCurrency(expenses)} Ausgaben`,
    `Fokus diese Woche: ${focusMin} Min.`,
  ]

  if (mealCosts.estimatedTotal > 0) {
    lines.push(`Meal Prep: ~${formatCurrency(mealCosts.estimatedTotal)} Wochenkosten (${mealCosts.slotsWithCost} Mahlzeiten mit Preis)`)
  }
  if (grocery.total > 0) {
    lines.push(`Einkauf: ${grocery.open} offen / ${grocery.total} Artikel`)
  }
  if (goalsLinked > 0) {
    lines.push(`Ziele mit Gewohnheiten: ${goalsLinked}`)
  }

  return lines.join('\n')
}

export function buildWeeklyReviewExport(
  data: AppData,
  review?: WeeklyReview | null,
  userName?: string,
): string {
  const weekStart = getWeekStart()
  const sections = [
    buildWeeklyLifeScoreReport(data, userName),
    '',
    '── Wochenreview ──',
    `Zeitraum: ${formatWeekRange(weekStart)}`,
    '',
    buildWeeklyStatsSummary(data),
  ]

  if (review) {
    sections.push(
      '',
      review.wins ? `🏆 Was lief gut?\n${review.wins}` : '',
      review.improvements ? `\n💡 Verbesserungen\n${review.improvements}` : '',
      review.nextWeek ? `\n🎯 Fokus nächste Woche\n${review.nextWeek}` : '',
    )
  }

  return sections.filter(Boolean).join('\n')
}

export async function shareWeeklyReviewExport(
  data: AppData,
  review?: WeeklyReview | null,
  userName?: string,
): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildWeeklyReviewExport(data, review, userName)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Wochenreview Lebensfluss', text })
      return 'shared'
    } catch {
      /* clipboard fallback */
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function downloadWeeklyReviewExport(
  data: AppData,
  review?: WeeklyReview | null,
  userName?: string,
): void {
  const text = buildWeeklyReviewExport(data, review, userName)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wochenreview-${getWeekStart()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export const weeklyReviewPrompts = {
  wins: ['Größter Erfolg diese Woche?', 'Wobei warst du stolz auf dich?', 'Was lief besser als erwartet?'],
  improvements: ['Was hat Energie gekostet?', 'Wo bist du vom Plan abgewichen?', 'Was möchtest du ändern?'],
  nextWeek: ['Ein Fokus für nächste Woche:', 'Welche Gewohnheit ist Priorität?', 'Was lässt du bewusst weg?'],
}