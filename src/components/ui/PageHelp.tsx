import { useState } from 'react'
import { HelpCircle, X, Lightbulb } from 'lucide-react'
import { pageHelp } from '../../lib/pageHelp'

interface PageHelpProps {
  pageId: string
}

export function PageHelp({ pageId }: PageHelpProps) {
  const [open, setOpen] = useState(false)
  const content = pageHelp[pageId]
  if (!content) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-emerald-400 transition-colors shrink-0"
        aria-label="Hilfe"
      >
        <HelpCircle size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg glass rounded-t-3xl sm:rounded-3xl p-6 safe-bottom slide-up max-h-[80dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{content.title}</h2>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover-surface">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted mb-5 leading-relaxed">{content.intro}</p>
            <div className="space-y-4 mb-5">
              {content.sections.map(s => (
                <div key={s.title}>
                  <h3 className="text-sm font-medium text-emerald-400 mb-1">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
            {content.tips && content.tips.length > 0 && (
              <div className="glass rounded-2xl p-4 border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-amber-400" />
                  <span className="text-sm font-medium">Tipp</span>
                </div>
                {content.tips.map(t => (
                  <p key={t} className="text-sm text-muted">{t}</p>
                ))}
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-5 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  )
}