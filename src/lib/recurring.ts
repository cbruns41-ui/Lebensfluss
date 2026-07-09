import type { AppData } from '../types'
import { generateId, toDateKey } from './utils'

const MAX_BACKFILL_MONTHS = 12

function monthKeysBetween(earliest: string, latest: string): string[] {
  const [ey, em] = earliest.split('-').map(Number)
  const [ly, lm] = latest.split('-').map(Number)
  const keys: string[] = []
  let y = ey
  let m = em
  while (y < ly || (y === ly && m <= lm)) {
    keys.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }
  return keys
}

function getEarliestMonth(recId: string, transactions: AppData['transactions'], today: string): string {
  const dated = transactions
    .filter(t => t.recurringId === recId)
    .map(t => t.date.slice(0, 7))
    .sort()
  if (dated.length > 0) return dated[0]

  const d = new Date(today + 'T12:00:00')
  d.setMonth(d.getMonth() - (MAX_BACKFILL_MONTHS - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function applyRecurringTransactions(data: AppData): AppData {
  const today = toDateKey(new Date())
  let transactions = [...data.transactions]
  let changed = false

  for (const rec of data.recurringTransactions ?? []) {
    if (!rec.active) continue

    const earliest = getEarliestMonth(rec.id, transactions, today)
    const months = monthKeysBetween(earliest, today.slice(0, 7)).slice(-MAX_BACKFILL_MONTHS)

    for (const monthKey of months) {
      const day = String(rec.dayOfMonth).padStart(2, '0')
      const daysInMonth = new Date(
        parseInt(monthKey.slice(0, 4), 10),
        parseInt(monthKey.slice(5, 7), 10),
        0,
      ).getDate()
      if (rec.dayOfMonth > daysInMonth) continue

      const dueDate = `${monthKey}-${day}`
      if (dueDate > today) continue

      const exists = transactions.some(
        t => t.recurringId === rec.id && t.date.startsWith(monthKey),
      )
      if (exists) continue

      transactions.unshift({
        id: generateId(),
        categoryId: rec.categoryId,
        amount: rec.amount,
        note: rec.note || rec.name,
        date: dueDate,
        type: rec.type,
        recurringId: rec.id,
      })
      changed = true
    }
  }

  return changed ? { ...data, transactions } : data
}