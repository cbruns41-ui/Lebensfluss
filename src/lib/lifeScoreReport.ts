import type { AppData } from '../types'
import { getActiveFocusMode, formatWeekRange, getWeekStart } from './sundayRitual'
import { FOCUS_MODE_LABELS } from './focusMode'
import { computeLifeScore, getLifeScoreForDate, getScoreLabel } from './lifeScore'
import { getTodayHabitProgress } from './habits'
import { generateInsights } from './insights'
import { formatCurrency, toDateKey } from './utils'

export function buildWeeklyLifeScoreReport(data: AppData, userName?: string): string {
  const weekStart = getWeekStart()

  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + 'T12:00:00')
    d.setDate(d.getDate() + i)
    if (toDateKey(d) <= toDateKey(new Date())) days.push(toDateKey(d))
  }

  const scores = days.map(d => ({ date: d, score: getLifeScoreForDate(data, d) }))
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
    : computeLifeScore(data).total
  const best = scores.length > 0 ? scores.reduce((a, b) => (b.score > a.score ? b : a)) : null
  const worst = scores.length > 0 ? scores.reduce((a, b) => (b.score < a.score ? b : a)) : null
  const todayBreakdown = computeLifeScore(data)
  const focusMode = getActiveFocusMode(data)

  let habitPerfectDays = 0
  for (const dayKey of days) {
    const d = new Date(dayKey + 'T12:00:00')
    const { done, total } = getTodayHabitProgress(data.habits, data.habitCompletions, d)
    if (total > 0 && done === total) habitPerfectDays++
  }

  const monthKey = toDateKey(new Date()).slice(0, 7)
  const expenses = data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0)

  const focusMin = data.focusSessions
    .filter(s => s.type === 'work' && days.includes(s.date))
    .reduce((s, f) => s + f.durationMin, 0)

  const topInsight = generateInsights(data)[0]
  const ritual = data.weeklyRitual
  const focusHabits = ritual.focusHabitIds
    .map(id => data.habits.find(h => h.id === id)?.name)
    .filter(Boolean)

  const lines = [
    `📊 Lebensfluss Wochenreport`,
    userName ? `für ${userName}` : '',
    `KW ${formatWeekRange(weekStart)}`,
    '',
    `Life Score: ${todayBreakdown.total}/100 (${todayBreakdown.label})`,
    `Ø diese Woche: ${avgScore} (${getScoreLabel(avgScore)})`,
    '',
    'Aufschlüsselung heute:',
    `  Gewohnheiten ${todayBreakdown.habits}% · Wellness ${todayBreakdown.wellness}%`,
    `  Budget ${todayBreakdown.budget}% · Fokus ${todayBreakdown.focus}% · Reflexion ${todayBreakdown.reflection}%`,
    '',
    `Gewohnheiten: ${habitPerfectDays}/${days.length} perfekte Tage`,
    `Budget Monat: ${formatCurrency(expenses)} Ausgaben`,
    `Fokus: ${focusMin} Min.`,
    `Fokus-Woche: ${FOCUS_MODE_LABELS[focusMode]}`,
  ]

  if (focusHabits.length > 0) {
    lines.push(`Prioritäts-Gewohnheiten: ${focusHabits.join(', ')}`)
  }

  if (best && worst && best.date !== worst.date) {
    const fmt = (k: string) => new Date(k + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' })
    lines.push('', `Bester Tag: ${fmt(best.date)} (${best.score}) · Schwächster: ${fmt(worst.date)} (${worst.score})`)
  }

  if (topInsight) {
    lines.push('', `💡 ${topInsight.title}: ${topInsight.body}`)
  }

  const review = data.weeklyReviews.find(r => r.weekStart === weekStart)
  if (review?.wins) {
    lines.push('', `🏆 Highlight: ${review.wins.split('\n')[0]}`)
  }

  lines.push('', '— Lebensfluss · lokal & privat')

  return lines.filter(l => l !== '').join('\n')
}

export async function shareWeeklyReport(data: AppData, userName?: string): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildWeeklyLifeScoreReport(data, userName)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Life Score Wochenreport', text })
      return 'shared'
    } catch {
      /* fall through to clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}