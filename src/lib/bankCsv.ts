import type { Transaction } from '../types'
import { generateId } from './utils'

export interface CsvImportResult {
  transactions: Transaction[]
  skipped: number
  errors: string[]
}

function parseGermanAmount(raw: string): number | null {
  const cleaned = raw.replace(/[€\s"]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? Math.abs(n) : null
}

function parseDate(raw: string): string | null {
  const t = raw.trim().replace(/"/g, '')
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10)
  const dmY = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (dmY) return `${dmY[3]}-${dmY[2].padStart(2, '0')}-${dmY[1].padStart(2, '0')}`
  return null
}

export function parseBankCsv(text: string, defaultCategoryId: string): CsvImportResult {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  const errors: string[] = []
  const transactions: Transaction[] = []
  let skipped = 0

  if (lines.length < 2) {
    return { transactions: [], skipped: 0, errors: ['Datei enthält zu wenig Zeilen.'] }
  }

  const sep = lines[0].includes(';') ? ';' : ','
  const header = lines[0].toLowerCase()
  const dateIdx = ['datum', 'buchungstag', 'date', 'valuta'].findIndex(k => header.includes(k))
  const amountIdx = ['betrag', 'umsatz', 'amount', 'wert'].findIndex(k => header.includes(k))
  const noteIdx = ['verwendungszweck', 'buchungstext', 'beschreibung', 'text', 'payee'].findIndex(k => header.includes(k))

  const startRow = dateIdx >= 0 || amountIdx >= 0 ? 1 : 0

  for (let i = startRow; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
    if (cols.length < 2) { skipped++; continue }

    let date: string | null = null
    let amount: number | null = null
    let note = ''

    if (dateIdx >= 0 && amountIdx >= 0) {
      date = parseDate(cols[dateIdx] ?? '')
      amount = parseGermanAmount(cols[amountIdx] ?? '')
      note = noteIdx >= 0 ? cols[noteIdx] ?? '' : cols.find(c => c.length > 3) ?? ''
    } else {
      date = parseDate(cols[0] ?? '')
      amount = parseGermanAmount(cols[cols.length - 1] ?? '')
      note = cols.slice(1, -1).join(' ')
    }

    if (!date || amount === null) {
      skipped++
      continue
    }

    const rawLine = cols.join(sep).toLowerCase()
    const type: Transaction['type'] = rawLine.includes('-') && (cols[amountIdx ?? cols.length - 1]?.includes('-'))
      ? 'expense' : 'expense'

    transactions.push({
      id: generateId(),
      categoryId: defaultCategoryId,
      amount,
      note: note.slice(0, 120) || 'CSV-Import',
      date,
      type,
    })
  }

  if (transactions.length === 0) {
    errors.push('Keine gültigen Buchungen erkannt. Erwartet: Datum, Betrag, Verwendungszweck (Semikolon oder Komma).')
  }

  return { transactions, skipped, errors }
}