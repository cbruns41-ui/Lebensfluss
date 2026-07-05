import type { AppData } from '../types'
import { formatCurrency } from './utils'
import { computeLifeScore, getLifeScoreHistory } from './lifeScore'

export function exportStatsCsv(data: AppData): void {
  const lifeScore = computeLifeScore(data)
  const avgLifeScore = Math.round(
    getLifeScoreHistory(data, 7).reduce((s, h) => s + h.score, 0) / 7,
  )
  const rows = [
    ['Bereich', 'Wert'],
    ['Life Score heute', String(lifeScore.total)],
    ['Life Score Label', lifeScore.label],
    ['Life Score Ø 7 Tage', String(avgLifeScore)],
    ['Gewohnheiten', String(data.habits.length)],
    ['Erledigte Completions', String(data.habitCompletions.length)],
    ['Transaktionen', String(data.transactions.length)],
    ['Ausgaben gesamt', formatCurrency(data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))],
    ['Einnahmen gesamt', formatCurrency(data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))],
    ['Spar-Wochen erledigt', String(data.savingsWeeks.filter(w => w.completed).length)],
    ['Gespart', formatCurrency(data.savingsWeeks.filter(w => w.completed).reduce((s, w) => s + w.amount, 0))],
    ['Fokus-Minuten', String(data.focusSessions.filter(s => s.type === 'work').reduce((s, f) => s + f.durationMin, 0))],
    ['Tagebuch-Einträge', String(data.journalEntries.length)],
    ['Ziele', String(data.goals.length)],
    ['Ziele erreicht', String(data.goals.filter(g => g.current >= g.target).length)],
  ]

  const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lebensfluss-statistik-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}