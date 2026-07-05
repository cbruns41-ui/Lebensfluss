import { NavLink } from 'react-router-dom'
import {
  PiggyBank, CalendarDays, Flag, Settings, LogOut, X, Download,
  Droplets, BookOpen, Timer, BarChart3, Award, ClipboardList, CalendarRange, Sun, Wallet,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const moreItems = [
  { to: '/app/finanzen', icon: Wallet, label: 'Budget', desc: 'Einnahmen, Ausgaben & Meal-Kosten', color: 'blue' },
  { to: '/app/wellness', icon: Droplets, label: 'Wellness', desc: 'Wasser, Stimmung & Schlaf', color: 'cyan' },
  { to: '/app/tagebuch', icon: BookOpen, label: 'Tagebuch', desc: 'Gedanken & Dankbarkeit', color: 'rose' },
  { to: '/app/fokus', icon: Timer, label: 'Fokus-Timer', desc: 'Pomodoro für Konzentration', color: 'emerald' },
  { to: '/app/spar-challenge', icon: PiggyBank, label: 'Spar-Challenge', desc: '52 Wochen sparen', color: 'amber' },
  { to: '/app/planer', icon: CalendarDays, label: 'Monatsplaner', desc: 'Aufgaben & Notizen', color: 'blue' },
  { to: '/app/ziele', icon: Flag, label: 'Ziele', desc: 'Meilensteine verfolgen', color: 'pink' },
  { to: '/app/statistik', icon: BarChart3, label: 'Statistik', desc: 'Fortschritte & Charts', color: 'purple' },
  { to: '/app/rueckblick', icon: CalendarRange, label: 'Rückblick', desc: 'Monats- & Jahresübersicht', color: 'teal' },
  { to: '/app/erfolge', icon: Award, label: 'Erfolge', desc: 'Abzeichen sammeln', color: 'amber' },
  { to: '/app/wochenreview', icon: ClipboardList, label: 'Wochenreview', desc: 'Woche reflektieren', color: 'indigo' },
  { to: '/app/wochenritual', icon: Sun, label: 'Sonntags-Ritual', desc: 'Geführter Wochenstart', color: 'amber' },
  { to: '/app/einstellungen', icon: Settings, label: 'Einstellungen', desc: 'Profil, Design & Backup', color: 'slate' },
]

const colorMap: Record<string, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-400',
  rose: 'bg-rose-500/15 text-rose-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  pink: 'bg-pink-500/15 text-pink-400',
  purple: 'bg-purple-500/15 text-purple-400',
  indigo: 'bg-indigo-500/15 text-indigo-400',
  slate: 'bg-slate-500/15 text-slate-400',
  teal: 'bg-teal-500/15 text-teal-400',
}

interface MoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const { logout } = useAuth()

  if (!open) return null

  const handleInstall = async () => {
    const deferred = window.deferredPrompt
    if (deferred) {
      await deferred.prompt()
    } else {
      alert('Tippe in Safari auf „Teilen" → „Zum Home-Bildschirm" oder in Chrome auf „App installieren".')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-t-3xl p-6 safe-bottom slide-up max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Alle Funktionen</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1 mb-4">
          {moreItems.map(({ to, icon: Icon, label, desc, color }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-700/40 transition-all active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted truncate">{desc}</p>
              </div>
            </NavLink>
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-700/50 pt-4">
          <button
            onClick={handleInstall}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-700/40 transition-all w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Download size={20} className="text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">App installieren</p>
              <p className="text-xs text-muted">Ohne App Store</p>
            </div>
          </button>
          <button
            onClick={() => { logout(); onClose() }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 transition-all w-full text-red-400"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Abmelden</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}