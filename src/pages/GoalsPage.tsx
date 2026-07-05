import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Flag, Pencil, Link2, Target } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, cn } from '../lib/utils'
import { getLinkedHabitStats, computeHabitDrivenCurrent } from '../lib/goalHabits'
import type { Goal } from '../types'

export function GoalsPage() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [current, setCurrent] = useState('0')
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>([])
  const [habitDrivenProgress, setHabitDrivenProgress] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setTitle(''); setTarget(''); setUnit(''); setDeadline(''); setCurrent('0')
    setLinkedHabitIds([])
    setHabitDrivenProgress(false)
    setModalOpen(true)
  }

  const openEdit = (g: Goal) => {
    setEditingId(g.id)
    setTitle(g.title); setTarget(String(g.target)); setUnit(g.unit); setDeadline(g.deadline); setCurrent(String(g.current))
    setLinkedHabitIds(g.linkedHabitIds ?? [])
    setHabitDrivenProgress(!!g.habitDrivenProgress)
    setModalOpen(true)
  }

  const toggleLinkedHabit = (habitId: string) => {
    setLinkedHabitIds(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId],
    )
  }

  const save = () => {
    if (!title.trim()) return
    const baseGoal: Goal = {
      id: editingId ?? generateId(),
      title: title.trim(),
      target: parseFloat(target) || 100,
      current: parseFloat(current) || 0,
      unit: unit.trim() || '%',
      deadline,
      linkedHabitIds: linkedHabitIds.length ? linkedHabitIds : undefined,
      habitDrivenProgress: linkedHabitIds.length && habitDrivenProgress ? true : undefined,
    }
    const goal: Goal = baseGoal.habitDrivenProgress
      ? { ...baseGoal, current: computeHabitDrivenCurrent(baseGoal, data) }
      : baseGoal
    updateData(prev => ({
      ...prev,
      goals: editingId ? prev.goals.map(g => g.id === editingId ? goal : g) : [...prev.goals, goal],
    }))
    setModalOpen(false)
  }

  const updateProgress = (id: string, delta: number) => {
    updateData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) } : g),
    }))
  }

  const deleteGoal = (id: string) => {
    confirm({
      title: 'Ziel löschen?',
      message: 'Dieses Ziel und der Fortschritt werden entfernt.',
      onConfirm: () => updateData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) })),
    })
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Ziele" subtitle="Meilensteine & persönliche Ziele" helpId="ziele"
        actions={<Button size="sm" onClick={openCreate}><Plus size={16} /> Ziel</Button>} />

      {data.goals.length === 0 ? (
        <Card className="text-center py-12">
          <Flag size={40} className="mx-auto text-faint mb-4" />
          <Button onClick={openCreate}><Plus size={16} /> Erstes Ziel setzen</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.goals.map(goal => {
            const displayCurrent = goal.habitDrivenProgress
              ? computeHabitDrivenCurrent(goal, data)
              : goal.current
            const pct = goal.target > 0 ? (displayCurrent / goal.target) * 100 : 0
            const habitStats = getLinkedHabitStats(goal, data)
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline + 'T12:00:00').getTime() - Date.now()) / 86400000)
              : null
            return (
              <Card key={goal.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    {goal.deadline && (
                      <p className="text-xs text-faint">
                        Bis {new Date(goal.deadline).toLocaleDateString('de-DE')}
                        {daysLeft !== null && (
                          <span className={daysLeft < 0 ? ' text-red-400' : daysLeft <= 14 ? ' text-amber-400' : ''}>
                            {' '}· {daysLeft < 0 ? `${Math.abs(daysLeft)} Tage überfällig` : daysLeft === 0 ? 'Heute' : `noch ${daysLeft} Tage`}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(goal)} className="text-faint hover:text-emerald-400"><Pencil size={16} /></button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-faint hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {displayCurrent} / {goal.target} {goal.unit}
                    {goal.habitDrivenProgress && <span className="text-[10px] text-emerald-400/80 ml-1">aus Gewohnheiten</span>}
                  </span>
                  {!goal.habitDrivenProgress && (
                    <div className="flex gap-2">
                      <button onClick={() => updateProgress(goal.id, -1)} className="w-8 h-8 rounded-lg bg-slate-800 text-sm">−</button>
                      <button onClick={() => updateProgress(goal.id, 1)} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">+</button>
                    </div>
                  )}
                </div>
                {habitStats && (
                  <div className="mt-3 pt-3 border-t border-slate-700/40">
                    <p className="text-[10px] text-faint uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Link2 size={10} /> Verknüpfte Gewohnheiten
                      <Link to="/app/gewohnheiten" className="ml-auto text-emerald-400 normal-case flex items-center gap-0.5">
                        <Target size={10} /> Öffnen
                      </Link>
                    </p>
                    <p className="text-[10px] text-muted mb-2">
                      Heute {habitStats.todayDone}/{habitStats.todayTotal} · Woche {habitStats.completionsThisWeek}× · Best-Streak {habitStats.bestStreak}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {goal.linkedHabitIds!.map(hid => {
                        const habit = data.habits.find(h => h.id === hid)
                        if (!habit) return null
                        const todayDone = data.habitCompletions.some(
                          c => c.habitId === hid && c.date === new Date().toISOString().split('T')[0],
                        )
                        return (
                          <span
                            key={hid}
                            className={cn(
                              'text-xs px-2 py-1 rounded-lg',
                              todayDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-muted',
                            )}
                          >
                            {habit.icon} {habit.name}{todayDone ? ' ✓' : ''}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                {pct >= 100 && <p className="text-center text-emerald-400 text-sm mt-3">🎉 Ziel erreicht!</p>}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Ziel bearbeiten' : 'Neues Ziel'}>
        <div className="space-y-4">
          <Input label="Ziel" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Zielwert" type="number" value={target} onChange={e => setTarget(e.target.value)} />
            <Input label="Einheit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg, %" />
          </div>
          {editingId && <Input label="Aktueller Stand" type="number" value={current} onChange={e => setCurrent(e.target.value)} />}
          <Input label="Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          {data.habits.length > 0 && (
            <div>
              <label className="text-sm text-muted mb-2 block">Gewohnheiten verknüpfen</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {data.habits.map(habit => (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleLinkedHabit(habit.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-sm transition-all',
                      linkedHabitIds.includes(habit.id) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800/50 text-muted',
                    )}
                  >
                    <span>{habit.icon}</span>
                    <span className="flex-1">{habit.name}</span>
                    {linkedHabitIds.includes(habit.id) && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
              {linkedHabitIds.length > 0 && (
                <label className="flex items-start gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={habitDrivenProgress}
                    onChange={e => setHabitDrivenProgress(e.target.checked)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <p className="text-sm">Fortschritt aus Gewohnheiten</p>
                    <p className="text-[10px] text-muted">Zählt Completions der verknüpften Habits (30 Tage) als Fortschritt — aktualisiert sich automatisch.</p>
                  </div>
                </label>
              )}
            </div>
          )}
          <Button onClick={save} className="w-full">{editingId ? 'Speichern' : 'Erstellen'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''}
        onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}