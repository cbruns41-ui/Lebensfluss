import { useState } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Check, Pencil, Bell, Flame, CalendarDays } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import {
  generateId, toDateKey, getDaysInMonth, formatMonthYear, HABIT_COLORS, HABIT_ICONS, cn,
} from '../lib/utils'
import { habitTemplates } from '../lib/habitTemplates'
import { applyHabitDrivenGoals } from '../lib/goalHabits'
import {
  defaultHabitFields, migrateHabit, getHabitStreak, isHabitDueOnDate, isCompleted,
  getWeeklyCompletionCount, formatScheduleLabel, formatReminderLabel,
  getTodayDueHabits, getTodayHabitProgress,
  WEEKDAY_LABELS_MON_FIRST, WEEKDAY_VALUES_MON_FIRST,
} from '../lib/habits'
import { getActiveFocusMode, getActiveRitual } from '../lib/sundayRitual'
import { filterHabitsForFocusWeek, FOCUS_MODE_LABELS } from '../lib/focusMode'
import type { Habit, HabitScheduleType } from '../types'

type View = 'today' | '31days' | 'monthly'

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function HabitTracker() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [view, setView] = useState<View>('today')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState(HABIT_ICONS[0])
  const [newColor, setNewColor] = useState(HABIT_COLORS[0])
  const [schedule, setSchedule] = useState<HabitScheduleType>('daily')
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
  const [timesPerWeek, setTimesPerWeek] = useState(3)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  const today = new Date()
  const todayKey = toDateKey(today)
  const last31Days = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (30 - i))
    return d
  })

  const resetForm = () => {
    const d = defaultHabitFields()
    setNewName('')
    setNewIcon(HABIT_ICONS[0])
    setNewColor(HABIT_COLORS[0])
    setSchedule(d.schedule ?? 'daily')
    setWeekdays(d.weekdays ?? [1, 2, 3, 4, 5])
    setTimesPerWeek(d.timesPerWeek ?? 3)
    setReminderEnabled(false)
    setReminderTime(d.reminder?.time ?? '09:00')
  }

  const openCreate = () => {
    setEditingId(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (habit: Habit) => {
    const h = migrateHabit(habit)
    setEditingId(h.id)
    setNewName(h.name)
    setNewIcon(h.icon)
    setNewColor(h.color)
    setSchedule((h.schedule ?? 'daily') as HabitScheduleType)
    setWeekdays(h.weekdays ?? [1, 2, 3, 4, 5])
    setTimesPerWeek(h.timesPerWeek ?? 3)
    setReminderEnabled(h.reminder?.enabled ?? false)
    setReminderTime(h.reminder?.time ?? '09:00')
    setModalOpen(true)
  }

  const toggleHabit = (habitId: string, date: string) => {
    updateData(prev => {
      const exists = prev.habitCompletions.some(c => c.habitId === habitId && c.date === date)
      const next = {
        ...prev,
        habitCompletions: exists
          ? prev.habitCompletions.filter(c => !(c.habitId === habitId && c.date === date))
          : [...prev.habitCompletions, { habitId, date }],
      }
      return applyHabitDrivenGoals(next)
    })
  }

  const buildHabitPayload = () => ({
    name: newName.trim(),
    icon: newIcon,
    color: newColor,
    schedule,
    weekdays: schedule === 'weekdays' ? weekdays : defaultHabitFields().weekdays,
    timesPerWeek: schedule === 'weekly' ? timesPerWeek : defaultHabitFields().timesPerWeek,
    reminder: { enabled: reminderEnabled, time: reminderTime },
  })

  const saveHabit = async () => {
    if (!newName.trim()) return
    if (reminderEnabled) await requestNotificationPermission()

    const payload = buildHabitPayload()
    if (editingId) {
      updateData(prev => ({
        ...prev,
        habits: prev.habits.map(h => h.id === editingId ? { ...h, ...payload } : h),
      }))
    } else {
      updateData(prev => ({
        ...prev,
        habits: [...prev.habits, {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...payload,
        }],
      }))
    }
    setModalOpen(false)
  }

  const deleteHabit = (id: string) => {
    confirm({
      title: 'Gewohnheit löschen?',
      message: 'Alle Einträge dieser Gewohnheit werden ebenfalls gelöscht.',
      onConfirm: () => updateData(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== id),
        habitCompletions: prev.habitCompletions.filter(c => c.habitId !== id),
        goals: prev.goals.map(g => ({
          ...g,
          linkedHabitIds: (g.linkedHabitIds ?? []).filter(hid => hid !== id),
        })),
        weeklyRitual: {
          ...prev.weeklyRitual,
          focusHabitIds: (prev.weeklyRitual.focusHabitIds ?? []).filter(hid => hid !== id),
        },
      })),
    })
  }

  const toggleWeekday = (day: number) => {
    setWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const activeRitual = getActiveRitual(data)
  const focusMode = getActiveFocusMode(data)
  const scopedHabits = filterHabitsForFocusWeek(
    data.habits,
    activeRitual.focusHabitIds ?? [],
    focusMode,
    !!activeRitual.completedAt,
  )
  const todayHabits = getTodayDueHabits(scopedHabits, data.habitCompletions, today)
  const { done: todayDone, total: todayTotal } = getTodayHabitProgress(scopedHabits, data.habitCompletions, today)
  const showFocusHint = !!activeRitual.completedAt && focusMode !== 'full' && (activeRitual.focusHabitIds?.length ?? 0) > 0

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto pb-4">
      <PageHeader
        title="Gewohnheiten"
        subtitle="Baue Routinen auf, Tag für Tag"
        helpId="gewohnheiten"
        actions={<Button size="sm" onClick={openCreate}><Plus size={18} /> Neu</Button>}
      />

      {showFocusHint && (
        <Card className="mb-4 border-emerald-500/15 py-2.5 px-4">
          <p className="text-xs text-muted">
            <span className="text-emerald-400 font-medium">Fokus-Woche ({FOCUS_MODE_LABELS[focusMode]}):</span>
            {focusMode === 'basics'
              ? ' Nur deine Prioritäts-Gewohnheiten sind heute sichtbar.'
              : ' Prioritäts-Gewohnheiten stehen oben — alle anderen darunter.'}
          </p>
        </Card>
      )}

      <div className="flex gap-1 mb-6 glass rounded-xl p-1">
        {([
          { id: 'today' as View, label: 'Heute' },
          { id: '31days' as View, label: '31 Tage' },
          { id: 'monthly' as View, label: 'Monat' },
        ]).map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={cn('flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
              view === v.id ? 'bg-emerald-500 text-white' : 'text-muted')}>
            {v.label}
          </button>
        ))}
      </div>

      {data.habits.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-4">🎯</p>
          <p className="font-medium mb-2">Noch keine Gewohnheiten</p>
          <p className="text-sm text-muted mb-4">Lege Routinen an – mit Erinnerungen pro Gewohnheit.</p>
          <Button onClick={openCreate}><Plus size={18} /> Gewohnheit hinzufügen</Button>
        </Card>
      ) : view === 'today' ? (
        <div className="space-y-4">
          <Card className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted">Heute erledigt</p>
              <p className="text-2xl font-bold text-emerald-400">{todayDone}/{todayTotal}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-[var(--progress-track)] flex items-center justify-center"
              style={{
                background: `conic-gradient(#10b981 ${todayTotal ? (todayDone / todayTotal) * 360 : 0}deg, transparent 0)`,
              }}>
              <span className="text-sm font-bold">{todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0}%</span>
            </div>
          </Card>

          {todayHabits.length === 0 ? (
            <Card className="text-center py-8 text-muted text-sm">
              <CalendarDays size={24} className="mx-auto mb-2 opacity-50" />
              Heute ist keine Gewohnheit fällig – Ruhetag!
            </Card>
          ) : (
            todayHabits.map(habit => {
              const done = habit.schedule === 'weekly'
                ? getWeeklyCompletionCount(habit.id, today, data.habitCompletions) >= (habit.timesPerWeek ?? 3)
                  || isCompleted(habit.id, todayKey, data.habitCompletions)
                : isCompleted(habit.id, todayKey, data.habitCompletions)
              const streak = getHabitStreak(habit, data.habitCompletions)
              const weekCount = habit.schedule === 'weekly'
                ? getWeeklyCompletionCount(habit.id, today, data.habitCompletions)
                : null

              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, todayKey)}
                  className={cn(
                    'w-full glass rounded-2xl p-4 text-left transition-all active:scale-[0.98]',
                    done ? 'ring-1 ring-emerald-500/40' : 'hover:border-slate-600',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all',
                        done ? 'opacity-100' : 'opacity-60')}
                      style={{ backgroundColor: `${habit.color}33` }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium flex items-center gap-2 flex-wrap', done && 'line-through text-muted')}>
                        {habit.name}
                        {habit.schedule === 'weekly' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-normal no-underline">
                            Wochenziel
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatScheduleLabel(habit)}
                        {weekCount !== null && ` · ${weekCount}/${habit.timesPerWeek ?? 3} diese Woche`}
                        {streak > 0 && ` · 🔥 ${streak}${habit.schedule === 'weekly' ? ' Wo.' : ''}`}
                      </p>
                      {formatReminderLabel(habit) && (
                        <p className="text-[10px] text-cyan-400/80 mt-1 flex items-center gap-1">
                          <Bell size={10} /> {formatReminderLabel(habit)} Uhr
                        </p>
                      )}
                    </div>
                    <div className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      done ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600',
                    )}>
                      {done && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      ) : view === '31days' ? (
        <div className="space-y-4">
          {scopedHabits.map(habit => {
            const h = migrateHabit(habit)
            const streak = getHabitStreak(h, data.habitCompletions)
            const dueDays = last31Days.filter(d => isHabitDueOnDate(h, d))
            const completed = dueDays.filter(d => isCompleted(h.id, toDateKey(d), data.habitCompletions)).length
            return (
              <Card key={habit.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-xs text-muted">
                        <Flame size={10} className="inline text-amber-400" /> {streak}{h.schedule === 'weekly' ? ' Wo.' : ' Tage'}
                        {' · '}{completed}/{dueDays.length} fällige Tage
                      </p>
                      <p className="text-[10px] text-faint">{formatScheduleLabel(h)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(habit)} className="p-2 text-muted hover:text-emerald-400"><Pencil size={16} /></button>
                    <button onClick={() => deleteHabit(habit.id)} className="p-2 text-muted hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(31, minmax(0, 1fr))' }}>
                  {last31Days.map((d, i) => {
                    const key = toDateKey(d)
                    const done = isCompleted(h.id, key, data.habitCompletions)
                    const due = isHabitDueOnDate(h, d)
                    return (
                      <button key={i} onClick={() => toggleHabit(h.id, key)}
                        className={cn('aspect-square rounded-md transition-all flex items-center justify-center',
                          !due && 'opacity-20',
                          due && !done && 'opacity-50',
                          due && done && 'opacity-100',
                          key === todayKey && 'ring-1 ring-white/50')}
                        style={{ backgroundColor: done ? h.color : due ? '#334155' : '#1e293b' }}
                        title={!due ? 'Nicht fällig' : undefined}>
                        {done && <Check size={8} className="text-white" />}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 rounded-xl hover:bg-slate-700/50"><ChevronLeft size={20} /></button>
            <span className="font-medium capitalize">{formatMonthYear(currentMonth)}</span>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 rounded-xl hover:bg-slate-700/50"><ChevronRight size={20} /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            {scopedHabits.map(h => (
              <button key={h.id} onClick={() => setSelectedHabit(h.id)}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap shrink-0',
                  selectedHabit === h.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass')}>
                {h.icon} {h.name}
              </button>
            ))}
          </div>
          {selectedHabit ? (
            <Card>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => <div key={d} className="text-center text-xs text-faint font-medium">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }).map((_, i) => <div key={`e-${i}`} />)}
                {monthDays.map(d => {
                  const key = toDateKey(d)
                  const habit = migrateHabit(data.habits.find(h => h.id === selectedHabit)!)
                  const done = isCompleted(selectedHabit, key, data.habitCompletions)
                  const due = isHabitDueOnDate(habit, d)
                  return (
                    <button key={key} onClick={() => toggleHabit(selectedHabit, key)}
                      className={cn('aspect-square rounded-xl flex flex-col items-center justify-center text-xs',
                        !due && 'opacity-25 bg-slate-900/40 text-faint',
                        due && !done && 'bg-slate-800/60 text-muted',
                        due && done && 'text-white',
                        key === todayKey && due && 'ring-2 ring-emerald-400')}
                      style={due && done ? { backgroundColor: habit.color } : undefined}>
                      <span className="font-medium">{d.getDate()}</span>
                      {done && due && <Check size={10} />}
                    </button>
                  )
                })}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-8 text-muted text-sm">Wähle eine Gewohnheit</Card>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {!editingId && (
            <div>
              <p className="text-sm text-muted mb-2">Vorlagen</p>
              <div className="flex flex-wrap gap-2">
                {habitTemplates.map(t => (
                  <button key={t.name} onClick={() => {
                    setNewName(t.name); setNewIcon(t.icon); setNewColor(t.color)
                    if (t.schedule) setSchedule(t.schedule)
                    if (t.weekdays) setWeekdays(t.weekdays)
                  }}
                    className="px-3 py-1.5 rounded-xl text-xs glass">{t.icon} {t.name}</button>
                ))}
              </div>
            </div>
          )}
          <Input label="Name" value={newName} onChange={e => setNewName(e.target.value)} />

          <div>
            <p className="text-sm text-muted mb-2">Zeitplan</p>
            <div className="flex gap-2 mb-3">
              {([
                { id: 'daily' as const, label: 'Täglich' },
                { id: 'weekdays' as const, label: 'Bestimmte Tage' },
                { id: 'weekly' as const, label: 'X× / Woche' },
              ]).map(opt => (
                <button key={opt.id} onClick={() => setSchedule(opt.id)}
                  className={cn('flex-1 py-2 rounded-xl text-xs font-medium',
                    schedule === opt.id ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'glass')}>
                  {opt.label}
                </button>
              ))}
            </div>
            {schedule === 'weekdays' && (
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAY_LABELS_MON_FIRST.map((label, i) => {
                  const day = WEEKDAY_VALUES_MON_FIRST[i]
                  return (
                    <button key={day} onClick={() => toggleWeekday(day)}
                      className={cn('w-10 h-10 rounded-xl text-xs font-medium',
                        weekdays.includes(day) ? 'bg-emerald-500 text-white' : 'glass text-muted')}>
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
            {schedule === 'weekly' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">Ziel:</span>
                {[2, 3, 4, 5, 6, 7].map(n => (
                  <button key={n} onClick={() => setTimesPerWeek(n)}
                    className={cn('w-9 h-9 rounded-xl text-sm',
                      timesPerWeek === n ? 'bg-emerald-500 text-white' : 'glass')}>{n}×</button>
                ))}
                <span className="text-xs text-faint">/ Woche</span>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium flex items-center gap-2"><Bell size={16} className="text-cyan-400" /> Erinnerung</span>
              <button type="button" onClick={async () => {
                if (!reminderEnabled) await requestNotificationPermission()
                setReminderEnabled(!reminderEnabled)
              }} className={cn('w-12 h-7 rounded-full relative', reminderEnabled ? 'bg-emerald-500' : 'bg-slate-700')}>
                <div className={cn('w-5 h-5 rounded-full bg-white absolute top-1 transition-all', reminderEnabled ? 'left-6' : 'left-1')} />
              </button>
            </label>
            {reminderEnabled && (
              <Input label="Uhrzeit" type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
            )}
            <p className="text-[10px] text-faint">Benachrichtigung nur wenn die App im Hintergrund offen ist (PWA installiert). Streak-Warnung in den Einstellungen.</p>
          </div>

          <div>
            <p className="text-sm text-muted mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(icon => (
                <button key={icon} onClick={() => setNewIcon(icon)}
                  className={cn('w-10 h-10 rounded-xl text-lg', newIcon === icon ? 'bg-emerald-500/20 ring-2 ring-emerald-400' : 'bg-slate-800')}>{icon}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted mb-2">Farbe</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(color => (
                <button key={color} onClick={() => setNewColor(color)}
                  className={cn('w-8 h-8 rounded-full', newColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900')}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <Button onClick={() => void saveHabit()} className="w-full">{editingId ? 'Speichern' : 'Erstellen'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''}
        confirmLabel={opts?.confirmLabel} onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}