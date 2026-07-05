import type { AppData } from '../types'
import { generateId, toDateKey } from './utils'

export function applyRecurringTransactions(data: AppData): AppData {
  const today = toDateKey(new Date())
  const monthKey = today.slice(0, 7)
  let transactions = [...data.transactions]
  let changed = false

  for (const rec of data.recurringTransactions ?? []) {
    if (!rec.active) continue
    const day = String(rec.dayOfMonth).padStart(2, '0')
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

  return changed ? { ...data, transactions } : data
}