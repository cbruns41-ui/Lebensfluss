import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, TrendingDown, TrendingUp, ArrowDownRight, ArrowUpRight, Pencil, ChevronLeft, ChevronRight, Repeat, Upload, UtensilsCrossed, ShoppingCart } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, formatCurrency, toDateKey, formatMonthYear, cn } from '../lib/utils'
import type { Transaction, BudgetCategory, RecurringTransaction } from '../types'
import { parseBankCsv } from '../lib/bankCsv'
import { computeWeeklyMealCosts, findFoodCategory, getGroceryBudgetSummary, getMealBudgetInsight } from '../lib/mealBudget'

export function BudgetTracker() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [filterMonth, setFilterMonth] = useState(new Date())
  const [txModal, setTxModal] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [editingTxId, setEditingTxId] = useState<string | null>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [txType, setTxType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [txDate, setTxDate] = useState(toDateKey(new Date()))
  const [categoryId, setCategoryId] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatLimit, setNewCatLimit] = useState('')
  const [recModal, setRecModal] = useState(false)
  const [editingRecId, setEditingRecId] = useState<string | null>(null)
  const [recName, setRecName] = useState('')
  const [recAmount, setRecAmount] = useState('')
  const [recNote, setRecNote] = useState('')
  const [recDay, setRecDay] = useState('1')
  const [recType, setRecType] = useState<'expense' | 'income'>('expense')
  const [recCategoryId, setRecCategoryId] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const csvInputRef = useRef<HTMLInputElement>(null)

  const monthKey = `${filterMonth.getFullYear()}-${String(filterMonth.getMonth() + 1).padStart(2, '0')}`
  const monthTransactions = data.transactions.filter(t => t.date.startsWith(monthKey))
  const expenses = monthTransactions.filter(t => t.type === 'expense')
  const income = monthTransactions.filter(t => t.type === 'income')
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalBudget = data.budgetCategories.reduce((s, c) => s + c.limit, 0)
  const mealCosts = computeWeeklyMealCosts(data.mealPlan, data.recipes)
  const grocerySummary = getGroceryBudgetSummary(data)
  const mealInsight = getMealBudgetInsight(data)
  const foodCategory = findFoodCategory(data.budgetCategories)

  const bookWeeklyMealCost = () => {
    if (mealCosts.estimatedTotal <= 0 || !foodCategory) return
    const tx: Transaction = {
      id: generateId(),
      categoryId: foodCategory.id,
      amount: Math.round(mealCosts.estimatedTotal * 100) / 100,
      note: 'Wochenplan Meal Prep (geschätzt)',
      date: toDateKey(new Date()),
      type: 'expense',
    }
    updateData(prev => ({ ...prev, transactions: [tx, ...prev.transactions] }))
  }

  const openTxCreate = () => {
    setEditingTxId(null)
    setTxType('expense')
    setAmount('')
    setNote('')
    setTxDate(toDateKey(new Date()))
    setCategoryId(data.budgetCategories[0]?.id ?? '')
    setTxModal(true)
  }

  const openTxEdit = (tx: Transaction) => {
    setEditingTxId(tx.id)
    setTxType(tx.type)
    setAmount(String(tx.amount))
    setNote(tx.note)
    setTxDate(tx.date)
    setCategoryId(tx.categoryId)
    setTxModal(true)
  }

  const openCatCreate = () => {
    setEditingCatId(null)
    setNewCatName('')
    setNewCatLimit('')
    setCatModal(true)
  }

  const openCatEdit = (cat: BudgetCategory) => {
    setEditingCatId(cat.id)
    setNewCatName(cat.name)
    setNewCatLimit(String(cat.limit))
    setCatModal(true)
  }

  const saveTransaction = () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) return
    const tx: Transaction = {
      id: editingTxId ?? generateId(),
      categoryId: categoryId || data.budgetCategories[0]?.id || '',
      amount: num,
      note: note.trim(),
      date: txDate,
      type: txType,
    }
    updateData(prev => ({
      ...prev,
      transactions: editingTxId
        ? prev.transactions.map(t => t.id === editingTxId ? tx : t)
        : [tx, ...prev.transactions],
    }))
    setTxModal(false)
  }

  const saveCategory = () => {
    if (!newCatName.trim()) return
    if (editingCatId) {
      updateData(prev => ({
        ...prev,
        budgetCategories: prev.budgetCategories.map(c =>
          c.id === editingCatId ? { ...c, name: newCatName.trim(), limit: parseFloat(newCatLimit) || 0 } : c,
        ),
      }))
    } else {
      updateData(prev => ({
        ...prev,
        budgetCategories: [...prev.budgetCategories, {
          id: generateId(), name: newCatName.trim(), limit: parseFloat(newCatLimit) || 0,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][prev.budgetCategories.length % 5],
        }],
      }))
    }
    setCatModal(false)
  }

  const deleteTransaction = (id: string) => {
    confirm({
      title: 'Eintrag löschen?',
      message: 'Dieser Buchungseintrag wird unwiderruflich entfernt.',
      onConfirm: () => updateData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) })),
    })
  }

  const deleteCategory = (id: string) => {
    confirm({
      title: 'Kategorie löschen?',
      message: 'Die Kategorie wird entfernt. Zugehörige Einträge bleiben erhalten.',
      onConfirm: () => updateData(prev => ({ ...prev, budgetCategories: prev.budgetCategories.filter(c => c.id !== id) })),
    })
  }

  const getCategorySpent = (catId: string) =>
    expenses.filter(t => t.categoryId === catId).reduce((s, t) => s + t.amount, 0)

  const openRecCreate = () => {
    setEditingRecId(null)
    setRecName('')
    setRecAmount('')
    setRecNote('')
    setRecDay('1')
    setRecType('expense')
    setRecCategoryId(data.budgetCategories[0]?.id ?? '')
    setRecModal(true)
  }

  const openRecEdit = (rec: RecurringTransaction) => {
    setEditingRecId(rec.id)
    setRecName(rec.name)
    setRecAmount(String(rec.amount))
    setRecNote(rec.note)
    setRecDay(String(rec.dayOfMonth))
    setRecType(rec.type)
    setRecCategoryId(rec.categoryId)
    setRecModal(true)
  }

  const saveRecurring = () => {
    const num = parseFloat(recAmount)
    const day = parseInt(recDay, 10)
    if (!recName.trim() || !num || num <= 0 || day < 1 || day > 28) return
    const rec: RecurringTransaction = {
      id: editingRecId ?? generateId(),
      name: recName.trim(),
      categoryId: recCategoryId || data.budgetCategories[0]?.id || '',
      amount: num,
      note: recNote.trim(),
      type: recType,
      dayOfMonth: day,
      active: editingRecId ? (data.recurringTransactions.find(r => r.id === editingRecId)?.active ?? true) : true,
    }
    updateData(prev => ({
      ...prev,
      recurringTransactions: editingRecId
        ? prev.recurringTransactions.map(r => r.id === editingRecId ? rec : r)
        : [...prev.recurringTransactions, rec],
    }))
    setRecModal(false)
  }

  const toggleRecurring = (id: string) => {
    updateData(prev => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.map(r =>
        r.id === id ? { ...r, active: !r.active } : r,
      ),
    }))
  }

  const deleteRecurring = (id: string) => {
    confirm({
      title: 'Dauerauftrag löschen?',
      message: 'Der Dauerauftrag wird entfernt. Bereits gebuchte Einträge bleiben.',
      onConfirm: () => updateData(prev => ({
        ...prev,
        recurringTransactions: prev.recurringTransactions.filter(r => r.id !== id),
      })),
    })
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const defaultCat = data.budgetCategories[0]?.id ?? ''
      const result = parseBankCsv(text, defaultCat)
      if (result.transactions.length > 0) {
        updateData(prev => ({
          ...prev,
          transactions: [...result.transactions, ...prev.transactions],
        }))
        setImportMsg(`${result.transactions.length} Buchungen importiert${result.skipped ? `, ${result.skipped} übersprungen` : ''}.`)
      } else {
        setImportMsg(result.errors[0] ?? 'Import fehlgeschlagen.')
      }
      setTimeout(() => setImportMsg(''), 5000)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Budget" subtitle="Finanzen im Griff behalten" helpId="finanzen"
        actions={<>
          <Button size="sm" variant="secondary" onClick={() => csvInputRef.current?.click()} title="CSV importieren">
            <Upload size={16} />
          </Button>
          <Button size="sm" variant="secondary" onClick={openCatCreate}><Plus size={16} /></Button>
          <Button size="sm" onClick={openTxCreate}><Plus size={16} /> Eintrag</Button>
        </>} />

      <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvImport} />
      {importMsg && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 mb-4">{importMsg}</p>
      )}

      <div className="flex items-center justify-between mb-4 glass rounded-xl px-3 py-2">
        <button onClick={() => setFilterMonth(new Date(filterMonth.getFullYear(), filterMonth.getMonth() - 1))} className="p-1.5"><ChevronLeft size={18} /></button>
        <span className="text-sm font-medium capitalize">{formatMonthYear(filterMonth)}</span>
        <button onClick={() => setFilterMonth(new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1))} className="p-1.5"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent">
          <TrendingDown size={16} className="text-red-400 mb-1" />
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-muted">Ausgaben</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <TrendingUp size={16} className="text-emerald-400 mb-1" />
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-muted">Einnahmen</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Budget-Auslastung</span>
          <span>{totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', totalExpenses > totalBudget ? 'bg-red-500' : 'bg-emerald-500')}
            style={{ width: `${totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0}%` }} />
        </div>
      </Card>

      {(mealCosts.plannedSlots > 0 || grocerySummary.totalItems > 0) && (
        <Card className="mb-6 border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed size={16} className="text-purple-400" />
            <span className="text-sm font-medium">Meal Prep & Einkauf</span>
          </div>
          {mealCosts.estimatedTotal > 0 ? (
            <p className="text-lg font-bold text-purple-300">{formatCurrency(mealCosts.estimatedTotal)}</p>
          ) : (
            <p className="text-sm text-muted">Wochenplan {mealCosts.mealPlanPercent}% — Kosten in Rezepten hinterlegen</p>
          )}
          <p className="text-xs text-muted mt-1">
            {mealCosts.slotsWithCost} Mahlzeiten mit Preis · {mealCosts.plannedSlots} geplant
          </p>
          {mealInsight && <p className="text-xs text-amber-400/90 mt-2 leading-relaxed">{mealInsight}</p>}
          {grocerySummary.totalItems > 0 && (
            <p className="text-xs text-muted mt-2 flex items-center gap-1">
              <ShoppingCart size={12} />
              {grocerySummary.openItems} Artikel offen auf der{' '}
              <Link to="/app/einkauf" className="text-emerald-400">Einkaufsliste</Link>
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Link to="/app/essen" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">Meal Prep</Button>
            </Link>
            {mealCosts.estimatedTotal > 0 && foodCategory && (
              <Button size="sm" variant="secondary" className="flex-1" onClick={bookWeeklyMealCost}>
                Als Ausgabe buchen
              </Button>
            )}
          </div>
        </Card>
      )}

      <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Kategorien</h2>
      <div className="space-y-2 mb-6">
        {data.budgetCategories.map(cat => {
          const spent = getCategorySpent(cat.id)
          const pct = cat.limit > 0 ? (spent / cat.limit) * 100 : 0
          return (
            <Card key={cat.id} className="py-3">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">{formatCurrency(spent)} / {formatCurrency(cat.limit)}</span>
                  <button onClick={() => openCatEdit(cat)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 100 ? '#ef4444' : cat.color }} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-2">
          <Repeat size={14} /> Daueraufträge
        </h2>
        <Button size="sm" variant="ghost" onClick={openRecCreate}><Plus size={14} /> Neu</Button>
      </div>
      {data.recurringTransactions.length === 0 ? (
        <Card className="text-center py-4 text-muted text-xs mb-6">
          Miete, Abos & Gehalt automatisch jeden Monat buchen
        </Card>
      ) : (
        <div className="space-y-2 mb-6">
          {data.recurringTransactions.map(rec => {
            const cat = data.budgetCategories.find(c => c.id === rec.categoryId)
            return (
              <Card key={rec.id} className={cn('flex items-center gap-3 py-3', !rec.active && 'opacity-50')}>
                <button onClick={() => toggleRecurring(rec.id)} className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                  rec.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-faint')}>
                  <Repeat size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rec.name}</p>
                  <p className="text-xs text-faint">Tag {rec.dayOfMonth} · {cat?.name}</p>
                </div>
                <span className={cn('text-sm font-medium', rec.type === 'expense' ? 'text-red-400' : 'text-emerald-400')}>
                  {rec.type === 'expense' ? '-' : '+'}{formatCurrency(rec.amount)}
                </span>
                <button onClick={() => openRecEdit(rec)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                <button onClick={() => deleteRecurring(rec.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
              </Card>
            )
          })}
        </div>
      )}

      <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Einträge</h2>
      {monthTransactions.length === 0 ? (
        <Card className="text-center py-8 text-muted text-sm">Keine Einträge in diesem Monat</Card>
      ) : (
        <div className="space-y-2">
          {monthTransactions.map(tx => {
            const cat = data.budgetCategories.find(c => c.id === tx.categoryId)
            return (
              <Card key={tx.id} className="flex items-center gap-3 py-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center',
                  tx.type === 'expense' ? 'bg-red-500/15' : 'bg-emerald-500/15')}>
                  {tx.type === 'expense' ? <ArrowDownRight size={18} className="text-red-400" /> : <ArrowUpRight size={18} className="text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.note || cat?.name || 'Eintrag'}</p>
                  <p className="text-xs text-faint">{tx.date} · {cat?.name}</p>
                </div>
                <span className={cn('text-sm font-medium', tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400')}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </span>
                <button onClick={() => openTxEdit(tx)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                <button onClick={() => deleteTransaction(tx.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={txModal} onClose={() => setTxModal(false)} title={editingTxId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}>
        <div className="space-y-4">
          <div className="flex gap-2 glass rounded-xl p-1">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} onClick={() => setTxType(t)}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium',
                  txType === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'text-muted')}>
                {t === 'expense' ? 'Ausgabe' : 'Einnahme'}
              </button>
            ))}
          </div>
          <Input label="Datum" type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
          <Input label="Betrag (€)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <Input label="Notiz" value={note} onChange={e => setNote(e.target.value)} />
          <div>
            <p className="text-sm text-muted mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              {data.budgetCategories.map(c => (
                <button key={c.id} onClick={() => setCategoryId(c.id)}
                  className={cn('px-3 py-1.5 rounded-xl text-sm', categoryId === c.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-muted')}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={saveTransaction} className="w-full">{editingTxId ? 'Speichern' : 'Hinzufügen'}</Button>
        </div>
      </Modal>

      <Modal open={catModal} onClose={() => setCatModal(false)} title={editingCatId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}>
        <div className="space-y-4">
          <Input label="Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <Input label="Monatslimit (€)" type="number" value={newCatLimit} onChange={e => setNewCatLimit(e.target.value)} />
          <Button onClick={saveCategory} className="w-full">{editingCatId ? 'Speichern' : 'Erstellen'}</Button>
        </div>
      </Modal>

      <Modal open={recModal} onClose={() => setRecModal(false)} title={editingRecId ? 'Dauerauftrag bearbeiten' : 'Neuer Dauerauftrag'}>
        <div className="space-y-4">
          <div className="flex gap-2 glass rounded-xl p-1">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} onClick={() => setRecType(t)}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium',
                  recType === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'text-muted')}>
                {t === 'expense' ? 'Ausgabe' : 'Einnahme'}
              </button>
            ))}
          </div>
          <Input label="Name" value={recName} onChange={e => setRecName(e.target.value)} placeholder="z.B. Miete, Netflix" />
          <Input label="Betrag (€)" type="number" step="0.01" value={recAmount} onChange={e => setRecAmount(e.target.value)} />
          <Input label="Tag im Monat (1–28)" type="number" min={1} max={28} value={recDay} onChange={e => setRecDay(e.target.value)} />
          <Input label="Notiz (optional)" value={recNote} onChange={e => setRecNote(e.target.value)} />
          <div>
            <p className="text-sm text-muted mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              {data.budgetCategories.map(c => (
                <button key={c.id} onClick={() => setRecCategoryId(c.id)}
                  className={cn('px-3 py-1.5 rounded-xl text-sm', recCategoryId === c.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-muted')}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={saveRecurring} className="w-full">{editingRecId ? 'Speichern' : 'Anlegen'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''}
        onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}