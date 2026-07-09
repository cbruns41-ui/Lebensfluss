import { useState } from 'react'
import { Plus, Trash2, Check, Pencil } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, cn, getCurrentMonthKey, formatMonthYear } from '../lib/utils'
import type { PlannerTask, PlannerNote } from '../types'

const weeks = [1, 2, 3, 4, 5]

function getCurrentMonthWeek(): number {
  return Math.min(5, Math.ceil(new Date().getDate() / 7))
}

const priorityOrder = { high: 0, medium: 1, low: 2 }
const priorityColors = { low: 'text-slate-400 bg-slate-500/10', medium: 'text-amber-400 bg-amber-500/10', high: 'text-red-400 bg-red-500/10' }
const priorityLabels = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' }

export function MonthlyPlanner() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [taskModal, setTaskModal] = useState(false)
  const [noteModal, setNoteModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<PlannerTask['priority']>('medium')
  const [week, setWeek] = useState<number | undefined>(undefined)
  const [noteContent, setNoteContent] = useState('')
  const [weekFilter, setWeekFilter] = useState<number | 'all'>('all')
  const currentWeek = getCurrentMonthWeek()
  const monthKey = getCurrentMonthKey()
  const monthNotes = data.plannerNotes.filter(n => n.month === monthKey || n.month === 'aktuell')

  const openTaskCreate = () => {
    setEditingTaskId(null); setTitle(''); setPriority('medium'); setWeek(undefined); setTaskModal(true)
  }

  const openTaskEdit = (task: PlannerTask) => {
    setEditingTaskId(task.id); setTitle(task.title); setPriority(task.priority); setWeek(task.week); setTaskModal(true)
  }

  const openNoteCreate = () => {
    setEditingNoteId(null); setNoteContent(''); setNoteModal(true)
  }

  const openNoteEdit = (note: PlannerNote) => {
    setEditingNoteId(note.id); setNoteContent(note.content); setNoteModal(true)
  }

  const saveTask = () => {
    if (!title.trim()) return
    const task: PlannerTask = { id: editingTaskId ?? generateId(), title: title.trim(), completed: false, priority, week }
    if (editingTaskId) {
      updateData(prev => ({
        ...prev,
        plannerTasks: prev.plannerTasks.map(t => t.id === editingTaskId ? { ...t, ...task, completed: t.completed } : t),
      }))
    } else {
      updateData(prev => ({ ...prev, plannerTasks: [...prev.plannerTasks, task] }))
    }
    setTaskModal(false)
  }

  const saveNote = () => {
    if (!noteContent.trim()) return
    if (editingNoteId) {
      updateData(prev => ({
        ...prev,
        plannerNotes: prev.plannerNotes.map(n => n.id === editingNoteId ? { ...n, content: noteContent.trim() } : n),
      }))
    } else {
      updateData(prev => ({
        ...prev,
        plannerNotes: [...prev.plannerNotes, { id: generateId(), content: noteContent.trim(), month: monthKey }],
      }))
    }
    setNoteModal(false)
  }

  const toggleTask = (id: string) => {
    updateData(prev => ({ ...prev, plannerTasks: prev.plannerTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }))
  }

  const deleteTask = (id: string) => {
    confirm({ title: 'Aufgabe löschen?', message: 'Die Aufgabe wird entfernt.', onConfirm: () =>
      updateData(prev => ({ ...prev, plannerTasks: prev.plannerTasks.filter(t => t.id !== id) })) })
  }

  const deleteNote = (id: string) => {
    confirm({ title: 'Notiz löschen?', message: 'Die Notiz wird entfernt.', onConfirm: () =>
      updateData(prev => ({ ...prev, plannerNotes: prev.plannerNotes.filter(n => n.id !== id) })) })
  }

  const completed = data.plannerTasks.filter(t => t.completed).length
  const openTasks = data.plannerTasks.filter(t => !t.completed).length
  const visibleWeeks = weekFilter === 'all' ? weeks : [weekFilter]

  const sortTasks = (tasks: PlannerTask[]) =>
    [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Monatsplaner" subtitle={formatMonthYear(new Date())} helpId="planer"
        actions={<Button size="sm" onClick={openTaskCreate}><Plus size={16} /> Aufgabe</Button>} />

      <Card className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">{completed}/{data.plannerTasks.length} erledigt</p>
          <p className="text-xs text-muted">{openTasks} offen · Kalenderwoche {currentWeek}</p>
        </div>
        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.plannerTasks.length > 0 ? (completed / data.plannerTasks.length) * 100 : 0}%` }} />
        </div>
      </Card>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setWeekFilter('all')} className={cn('px-3 py-1.5 rounded-xl text-xs shrink-0', weekFilter === 'all' ? 'bg-emerald-500 text-white' : 'glass')}>Alle</button>
        {weeks.map(w => (
          <button key={w} onClick={() => setWeekFilter(w)} className={cn('px-3 py-1.5 rounded-xl text-xs shrink-0', weekFilter === w ? 'bg-emerald-500 text-white' : w === currentWeek ? 'glass border border-emerald-500/30' : 'glass')}>
            W{w}{w === currentWeek ? ' ●' : ''}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        {visibleWeeks.map(w => {
          const weekTasks = sortTasks(data.plannerTasks.filter(t => t.week === w))
          if (weekFilter === 'all' && weekTasks.length === 0) return null
          return (
            <Card key={w} className={w === currentWeek ? 'border-emerald-500/25' : ''}>
              <h3 className="text-sm font-medium text-emerald-400 mb-3">
                Woche {w}{w === currentWeek && <span className="text-xs text-muted ml-2">aktuell</span>}
              </h3>
              {weekTasks.length === 0 ? <p className="text-xs text-faint">Keine Aufgaben</p> : weekTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onEdit={openTaskEdit} onDelete={deleteTask} />
              ))}
            </Card>
          )
        })}
      </div>

      {(weekFilter === 'all') && <Card className="mb-6">
        <h3 className="text-sm font-medium text-muted mb-3">Ohne Woche</h3>
        {sortTasks(data.plannerTasks.filter(t => !t.week)).map(task => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onEdit={openTaskEdit} onDelete={deleteTask} />
        ))}
      </Card>}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider">Notizen</h2>
        <button onClick={openNoteCreate} className="text-emerald-400 text-sm flex items-center gap-1"><Plus size={14} /> Notiz</button>
      </div>
      <div className="space-y-2">
        {monthNotes.length === 0 ? (
          <p className="text-xs text-faint text-center py-4">Noch keine Notizen für diesen Monat.</p>
        ) : monthNotes.map(note => (
          <Card key={note.id} className="flex items-start gap-3">
            <p className="text-sm flex-1">{note.content}</p>
            <button onClick={() => openNoteEdit(note)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
            <button onClick={() => deleteNote(note.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
          </Card>
        ))}
      </div>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title={editingTaskId ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}>
        <div className="space-y-4">
          <Input label="Aufgabe" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={cn('flex-1 py-2 rounded-xl text-sm', priority === p ? priorityColors[p] + ' ring-1 ring-current' : 'bg-slate-800 text-muted')}>
                {priorityLabels[p]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setWeek(undefined)} className={cn('px-3 py-1.5 rounded-xl text-sm', week === undefined ? 'bg-emerald-500/20 text-emerald-400' : 'glass')}>Keine</button>
            {weeks.map(w => (
              <button key={w} onClick={() => setWeek(w)} className={cn('px-3 py-1.5 rounded-xl text-sm', week === w ? 'bg-emerald-500/20 text-emerald-400' : 'glass')}>W{w}</button>
            ))}
          </div>
          <Button onClick={saveTask} className="w-full">{editingTaskId ? 'Speichern' : 'Hinzufügen'}</Button>
        </div>
      </Modal>

      <Modal open={noteModal} onClose={() => setNoteModal(false)} title={editingNoteId ? 'Notiz bearbeiten' : 'Neue Notiz'}>
        <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={4}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none focus:border-emerald-500/50" />
        <Button onClick={saveNote} className="w-full mt-4">{editingNoteId ? 'Speichern' : 'Hinzufügen'}</Button>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''} onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}

function TaskItem({ task, onToggle, onEdit, onDelete }: {
  task: PlannerTask; onToggle: (id: string) => void; onEdit: (t: PlannerTask) => void; onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <button onClick={() => onToggle(task.id)}
        className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
          task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600')}>
        {task.completed && <Check size={12} className="text-white" />}
      </button>
      <span className={cn('flex-1 text-sm', task.completed && 'line-through text-faint')}>{task.title}</span>
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', priorityColors[task.priority])}>{priorityLabels[task.priority]}</span>
      <button onClick={() => onEdit(task)} className="text-faint hover:text-emerald-400"><Pencil size={12} /></button>
      <button onClick={() => onDelete(task.id)} className="text-faint hover:text-red-400"><Trash2 size={12} /></button>
    </div>
  )
}