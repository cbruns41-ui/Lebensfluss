import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, PiggyBank, Trophy, Wallet } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressRing } from '../components/ui/ProgressRing'
import { formatCurrency, cn, generateId, toDateKey } from '../lib/utils'

function findSavingsCategory(categories: { id: string; name: string }[]): string | null {
  const match = categories.find(c =>
    /spar|sparen|savings|rücklage/i.test(c.name),
  )
  return match?.id ?? categories[0]?.id ?? null
}

export function SavingsChallenge() {
  const { data, updateData } = useData()
  const [bookToBudget, setBookToBudget] = useState(true)

  const completed = data.savingsWeeks.filter(w => w.completed)
  const totalSaved = completed.reduce((s, w) => s + w.amount, 0)
  const totalGoal = data.savingsWeeks.reduce((s, w) => s + w.amount, 0)
  const progress = (completed.length / 52) * 100

  const toggleWeek = (week: number) => {
    updateData(prev => {
      const target = prev.savingsWeeks.find(w => w.week === week)
      if (!target) return prev

      if (target.completed) {
        let transactions = prev.transactions
        if (target.budgetTransactionId) {
          transactions = transactions.filter(t => t.id !== target.budgetTransactionId)
        }
        return {
          ...prev,
          transactions,
          savingsWeeks: prev.savingsWeeks.map(w =>
            w.week === week ? { ...w, completed: false, budgetTransactionId: undefined } : w,
          ),
        }
      }

      let transactions = prev.transactions
      let budgetTransactionId: string | undefined

      if (bookToBudget) {
        const categoryId = findSavingsCategory(prev.budgetCategories)
        if (categoryId) {
          budgetTransactionId = generateId()
          transactions = [
            {
              id: budgetTransactionId,
              categoryId,
              amount: target.amount,
              note: `Spar-Challenge Woche ${week}`,
              date: toDateKey(new Date()),
              type: 'expense' as const,
            },
            ...transactions,
          ]
        }
      }

      return {
        ...prev,
        transactions,
        savingsWeeks: prev.savingsWeeks.map(w =>
          w.week === week ? { ...w, completed: true, budgetTransactionId } : w,
        ),
      }
    })
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Spar-Challenge" subtitle="52 Wochen — Schritt für Schritt sparen" helpId="spar-challenge" />

      <Card className="mb-6 bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/20">
        <div className="flex items-center gap-5">
          <ProgressRing progress={progress} size={80} color="#f59e0b">
            <PiggyBank size={24} className="text-amber-400" />
          </ProgressRing>
          <div>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalSaved)}</p>
            <p className="text-sm text-slate-400">von {formatCurrency(totalGoal)} gespart</p>
            <p className="text-xs text-slate-500 mt-1">{completed.length} von 52 Wochen ✓</p>
          </div>
        </div>
      </Card>

      <Card className="mb-4 border-blue-500/15">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bookToBudget}
            onChange={e => setBookToBudget(e.target.checked)}
            className="mt-1 accent-emerald-500"
          />
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Wallet size={14} className="text-blue-400" /> Im Budget buchen
            </p>
            <p className="text-xs text-muted mt-0.5">
              Beim Abhaken wird eine Einnahme im Budget erfasst — verknüpft mit deiner Spar-Challenge.
            </p>
            <Link to="/app/finanzen" className="text-xs text-emerald-400 mt-1 inline-block">Budget ansehen →</Link>
          </div>
        </label>
      </Card>

      {completed.length === 52 && (
        <Card className="mb-6 text-center py-6 bg-gradient-to-r from-amber-500/20 to-emerald-500/10 border-amber-500/30">
          <Trophy size={40} className="mx-auto text-amber-400 mb-3" />
          <p className="font-bold text-lg">Glückwunsch! 🎉</p>
          <p className="text-sm text-slate-400">Du hast die 52-Wochen Spar-Challenge gemeistert!</p>
        </Card>
      )}

      <div className="mb-4 p-4 glass rounded-2xl text-sm text-slate-400">
        <p><strong className="text-slate-200">So funktioniert's:</strong> In Woche 1 sparst du 10€, in Woche 2 sparst du 20€, … bis Woche 52 mit 520€. Am Ende hast du <strong className="text-amber-400">{formatCurrency(totalGoal)}</strong> gespart!</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {data.savingsWeeks.map(w => (
          <button
            key={w.week}
            onClick={() => toggleWeek(w.week)}
            className={cn(
              'aspect-square rounded-xl flex flex-col items-center justify-center transition-all active:scale-95',
              w.completed
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'glass hover:border-amber-500/30',
            )}
          >
            {w.completed ? (
              <Check size={16} />
            ) : (
              <span className="text-[10px] text-slate-500">W{w.week}</span>
            )}
            <span className={cn('text-[10px] font-medium mt-0.5', w.completed ? 'text-white/80' : 'text-slate-400')}>
              {w.amount}€
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}