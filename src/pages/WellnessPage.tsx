import { useState } from 'react'
import { Droplets, Smile, Moon, Plus, Minus, Pencil } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { toDateKey, cn, generateId } from '../lib/utils'
import { MiniChart } from '../components/ui/MiniChart'
import type { MoodEntry } from '../types'

const moods = [
  { value: 1 as const, emoji: '😢', label: 'Schlecht' },
  { value: 2 as const, emoji: '😕', label: 'Niedrig' },
  { value: 3 as const, emoji: '😐', label: 'Okay' },
  { value: 4 as const, emoji: '🙂', label: 'Gut' },
  { value: 5 as const, emoji: '😄', label: 'Super' },
]

type Tab = 'water' | 'mood' | 'sleep'

export function WellnessPage() {
  const { data, updateData } = useData()
  const [tab, setTab] = useState<Tab>('water')
  const [waterModal, setWaterModal] = useState(false)
  const [manualMl, setManualMl] = useState('')
  const [moodNote, setMoodNote] = useState('')
  const [moodModal, setMoodModal] = useState(false)
  const today = toDateKey(new Date())
  const { waterGoalMl, waterGlassMl } = data.settings

  const waterToday = data.waterEntries.find(w => w.date === today)?.ml ?? 0
  const waterPct = Math.min((waterToday / waterGoalMl) * 100, 100)
  const todayMood = data.moodEntries.find(m => m.date === today)
  const todaySleep = data.sleepEntries.find(s => s.date === today)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return toDateKey(d)
  })
  const waterChart = last7Days.map(key => data.waterEntries.find(w => w.date === key)?.ml ?? 0)
  const moodChart = last7Days.map(key => (data.moodEntries.find(m => m.date === key)?.mood ?? 0) * 20)

  const setWater = (ml: number) => {
    updateData(prev => {
      const entries = prev.waterEntries.some(w => w.date === today)
        ? prev.waterEntries.map(w => w.date === today ? { ...w, ml: Math.max(0, ml) } : w)
        : [...prev.waterEntries, { date: today, ml: Math.max(0, ml) }]
      return { ...prev, waterEntries: entries }
    })
  }

  const addWater = (ml: number) => setWater(waterToday + ml)

  const setMood = (mood: MoodEntry['mood'], note = '') => {
    updateData(prev => ({
      ...prev,
      moodEntries: [
        { id: todayMood?.id ?? generateId(), date: today, mood, note },
        ...prev.moodEntries.filter(m => m.date !== today),
      ],
    }))
    setMoodModal(false)
  }

  const openMoodEdit = () => {
    setMoodNote(todayMood?.note ?? '')
    setMoodModal(true)
  }

  const setSleep = (hours: number, quality: 1 | 2 | 3 | 4 | 5) => {
    updateData(prev => ({
      ...prev,
      sleepEntries: [{ date: today, hours, quality }, ...prev.sleepEntries.filter(s => s.date !== today)],
    }))
  }

  const clearSleep = () => {
    updateData(prev => ({ ...prev, sleepEntries: prev.sleepEntries.filter(s => s.date !== today) }))
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Wellness" subtitle="Wasser, Stimmung & Schlaf" helpId="wellness" />

      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        {([{ id: 'water' as Tab, label: 'Wasser', icon: Droplets }, { id: 'mood' as Tab, label: 'Stimmung', icon: Smile }, { id: 'sleep' as Tab, label: 'Schlaf', icon: Moon }]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium', tab === id ? 'bg-emerald-500 text-white' : 'text-muted')}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'water' && (
        <>
          <Card className="mb-6 text-center">
            <p className="text-3xl font-bold mt-2">{waterToday} ml</p>
            <p className="text-sm text-muted mb-4">von {waterGoalMl} ml ({Math.round(waterPct)}%)</p>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => addWater(-waterGlassMl)} disabled={waterToday <= 0}><Minus size={16} /></Button>
              <Button size="sm" onClick={() => addWater(waterGlassMl)}><Plus size={16} /> Glas ({waterGlassMl}ml)</Button>
              <Button variant="secondary" size="sm" onClick={() => addWater(500)}>+500ml</Button>
              <Button variant="ghost" size="sm" onClick={() => { setManualMl(String(waterToday)); setWaterModal(true) }}>Manuell</Button>
            </div>
          </Card>
          <Card className="mb-4">
            <p className="text-xs text-muted mb-2">Letzte 7 Tage (ml)</p>
            <MiniChart data={waterChart} color="#06b6d4" height={48} />
          </Card>
        </>
      )}

      {tab === 'mood' && (
        <Card className="mb-6">
          <p className="text-sm text-muted mb-4 text-center">Wie fühlst du dich heute?</p>
          <div className="flex justify-between gap-2 mb-4">
            {moods.map(m => (
              <button key={m.value} onClick={() => setMood(m.value, todayMood?.note ?? '')}
                className={cn('flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl', todayMood?.mood === m.value ? 'bg-emerald-500/20 ring-2 ring-emerald-400' : 'glass')}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-muted">{m.label}</span>
              </button>
            ))}
          </div>
          {todayMood && (
            <div className="flex items-center justify-between glass rounded-xl p-3">
              <p className="text-sm text-muted">{todayMood.note || 'Keine Notiz'}</p>
              <button onClick={openMoodEdit} className="text-emerald-400"><Pencil size={16} /></button>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-muted mb-2">Stimmung – 7 Tage</p>
            <MiniChart data={moodChart} color="#a855f7" height={48} />
          </div>
        </Card>
      )}

      {tab === 'sleep' && (
        <Card>
          <p className="text-sm text-muted mb-4">Schlaf letzte Nacht</p>
          <label className="text-sm mb-2 block">Stunden: {todaySleep?.hours ?? 7}h</label>
          <input type="range" min={0} max={12} step={0.5} value={todaySleep?.hours ?? 7}
            onChange={e => setSleep(parseFloat(e.target.value), todaySleep?.quality ?? 3)} className="w-full accent-emerald-500 mb-4" />
          <p className="text-sm text-muted mb-3">Qualität</p>
          <div className="flex justify-between gap-2 mb-4">
            {([1, 2, 3, 4, 5] as const).map(q => (
              <button key={q} onClick={() => setSleep(todaySleep?.hours ?? 7, q)}
                className={cn('flex-1 py-3 rounded-xl text-sm', todaySleep?.quality === q ? 'bg-indigo-500/20 ring-2 ring-indigo-400' : 'glass')}>
                {'⭐'.repeat(q)}
              </button>
            ))}
          </div>
          {todaySleep && <Button variant="ghost" size="sm" className="w-full" onClick={clearSleep}>Heute zurücksetzen</Button>}
        </Card>
      )}

      <Modal open={waterModal} onClose={() => setWaterModal(false)} title="Wasser manuell setzen">
        <Input label="Milliliter" type="number" value={manualMl} onChange={e => setManualMl(e.target.value)} />
        <Button className="w-full mt-4" onClick={() => { setWater(parseInt(manualMl) || 0); setWaterModal(false) }}>Speichern</Button>
      </Modal>

      <Modal open={moodModal} onClose={() => setMoodModal(false)} title="Stimmung bearbeiten">
        <textarea value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={3} placeholder="Optional: Was beeinflusst deine Stimmung?"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none" />
        <Button className="w-full mt-4" onClick={() => todayMood && setMood(todayMood.mood, moodNote)} disabled={!todayMood}>Speichern</Button>
      </Modal>
    </div>
  )
}