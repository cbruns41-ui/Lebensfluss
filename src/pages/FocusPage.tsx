import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { generateId, toDateKey } from '../lib/utils'

export function FocusPage() {
  const { data, updateData } = useData()
  const { pomodoroWorkMin, pomodoroBreakMin } = data.settings
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [secondsLeft, setSecondsLeft] = useState(pomodoroWorkMin * 60)
  const [running, setRunning] = useState(false)
  const modeRef = useRef(mode)
  const runningRef = useRef(running)
  modeRef.current = mode
  runningRef.current = running

  const totalSec = (mode === 'work' ? pomodoroWorkMin : pomodoroBreakMin) * 60
  const progress = totalSec > 0 ? ((totalSec - secondsLeft) / totalSec) * 100 : 0

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setRunning(false)
          const m = modeRef.current
          const workMin = pomodoroWorkMin
          const breakMin = pomodoroBreakMin
          const completedMin = m === 'work' ? workMin : breakMin
          updateData(prev => ({
            ...prev,
            focusSessions: [{ id: generateId(), date: toDateKey(new Date()), durationMin: completedMin, type: m }, ...prev.focusSessions],
          }))
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
          const next = m === 'work' ? 'break' : 'work'
          setMode(next)
          setSecondsLeft((next === 'work' ? workMin : breakMin) * 60)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, pomodoroWorkMin, pomodoroBreakMin, updateData])

  const switchMode = (m: 'work' | 'break') => {
    setRunning(false)
    setMode(m)
    setSecondsLeft((m === 'work' ? pomodoroWorkMin : pomodoroBreakMin) * 60)
  }

  const reset = () => switchMode(mode)

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const todayFocus = data.focusSessions.filter(s => s.type === 'work' && s.date === toDateKey(new Date())).reduce((sum, s) => sum + s.durationMin, 0)
  const totalFocus = data.focusSessions.filter(s => s.type === 'work').reduce((s, f) => s + f.durationMin, 0)

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Fokus-Timer" subtitle="Pomodoro für Konzentration" helpId="fokus" />

      <div className="flex gap-2 mb-8 glass rounded-xl p-1">
        {(['work', 'break'] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${mode === m ? (m === 'work' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white') : 'text-muted'}`}>
            {m === 'work' ? `Fokus (${pomodoroWorkMin}m)` : `Pause (${pomodoroBreakMin}m)`}
          </button>
        ))}
      </div>

      <Card className="mb-6 text-center py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `conic-gradient(${mode === 'work' ? '#10b981' : '#3b82f6'} ${progress}%, transparent ${progress}%)` }} />
        <Timer size={32} className={`mx-auto mb-4 ${mode === 'work' ? 'text-emerald-400' : 'text-blue-400'}`} />
        <p className="text-6xl font-bold tabular-nums">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</p>
        <p className="text-sm text-muted mt-2">{running ? 'Läuft...' : 'Bereit?'}</p>
      </Card>

      <div className="flex gap-3 justify-center mb-8">
        <Button size="lg" onClick={() => setRunning(!running)} className={running ? '' : 'glow-accent'}>
          {running ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
        </Button>
        <Button size="lg" variant="secondary" onClick={reset}><RotateCcw size={20} /></Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-4"><p className="text-2xl font-bold text-emerald-400">{todayFocus}</p><p className="text-xs text-muted">Min. heute</p></Card>
        <Card className="text-center py-4"><p className="text-2xl font-bold">{totalFocus}</p><p className="text-xs text-muted">Min. gesamt</p></Card>
      </div>
    </div>
  )
}