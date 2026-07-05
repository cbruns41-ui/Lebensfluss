import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { generateId } from '../lib/utils'

export function QuickCapture() {
  const { updateData } = useData()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const save = () => {
    if (!text.trim()) return
    updateData(prev => ({
      ...prev,
      quickNotes: [{
        id: generateId(),
        content: text.trim(),
        createdAt: new Date().toISOString(),
        pinned: false,
      }, ...prev.quickNotes],
    }))
    setText('')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 z-30 w-14 h-14 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-95 transition-all glow-accent"
        aria-label="Schnelle Notiz"
      >
        <Plus size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg glass rounded-t-3xl p-6 safe-bottom slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Schnelle Notiz</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-slate-700/50">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Gedanke festhalten..."
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={save}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm active:scale-[0.98] transition-all"
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </>
  )
}