import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sun, Moon, Monitor, Download, Upload, Droplets, Timer, PiggyBank, RotateCcw,
  CreditCard, Trash2, XCircle, LifeBuoy, Target, Flame,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { brand } from '../config/brand'
import { localStorageHints } from '../config/storage'
import { exportData, importData } from '../lib/backup'
import { regenerateSavingsWeeks, defaultAppData } from '../lib/storage'
import { cn } from '../lib/utils'
import {
  getSubscriptionLabel, getDaysRemaining, canCancelSubscription, isDemoUser, hasActiveAccess,
} from '../lib/subscription'
import { formatPrice, pricing } from '../config/pricing'
import type { UserSettings } from '../types'

export function SettingsPage() {
  const { user, updateProfile, cancelSubscription, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const { data, updateData } = useData()
  const { theme, setTheme } = useTheme()
  const { confirm, cancel, opts } = useConfirm()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [aboMsg, setAboMsg] = useState('')

  const updateSettings = (patch: Partial<UserSettings>) => {
    updateData(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }))
    if (patch.theme) setTheme(patch.theme)
  }

  const saveProfile = () => {
    const err = updateProfile(name, email, password || undefined)
    if (err) setProfileMsg(err)
    else { setProfileMsg('Profil gespeichert!'); setPassword('') }
  }

  const handleExport = () => { if (user) exportData(data, user.name) }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importData(file)
      updateData(() => imported)
      setImportMsg('Backup erfolgreich importiert!')
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : 'Import fehlgeschlagen')
    }
    e.target.value = ''
  }

  const resetData = () => {
    confirm({
      title: 'Alle Daten zurücksetzen?',
      message: 'Alle Gewohnheiten, Einträge, Ziele usw. werden gelöscht. Dein Konto bleibt erhalten. Ein Backup wird empfohlen!',
      confirmLabel: 'Zurücksetzen',
      onConfirm: () => updateData(() => defaultAppData()),
    })
  }

  const handleCancelAbo = () => {
    confirm({
      title: 'Abo kündigen?',
      message: 'Dein Zugang bleibt bis zum Ende der bezahlten Periode bestehen. Danach benötigst du ein neues Abo oder die Einmalzahlung.',
      confirmLabel: 'Kündigen',
      onConfirm: () => {
        void cancelSubscription().then(err => {
          if (err) setAboMsg(err)
          else setAboMsg('Weiterleitung zum Stripe-Kundenportal…')
        })
      },
    })
  }

  const handleDeleteAccount = () => {
    confirm({
      title: 'Konto endgültig löschen?',
      message: 'Alle Daten werden unwiderruflich gelöscht – Gewohnheiten, Budget, Tagebuch, Abo-Status. Ein Backup wird dringend empfohlen!',
      confirmLabel: 'Konto löschen',
      onConfirm: async () => {
        const err = await deleteAccount()
        if (err) setAboMsg(err)
        else navigate('/', { replace: true })
      },
    })
  }

  const applySavingsIncrement = (increment: number) => {
    updateData(prev => ({
      ...prev,
      settings: { ...prev.settings, savingsIncrement: increment },
      savingsWeeks: regenerateSavingsWeeks(increment).map((w, i) => ({ ...w, completed: prev.savingsWeeks[i]?.completed ?? false })),
    }))
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto pb-8">
      <PageHeader title="Einstellungen" subtitle="Profil, Design & Daten" helpId="einstellungen" />

      <Card className="mb-6 space-y-3">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Neues Passwort (optional)" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leer lassen = unverändert" />
        <Button onClick={saveProfile} className="w-full" size="sm">Profil speichern</Button>
        {profileMsg && <p className={cn('text-xs text-center', profileMsg.includes('gespeichert') ? 'text-emerald-400' : 'text-red-400')}>{profileMsg}</p>}
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Erscheinungsbild</h2>
      <Card className="mb-6 flex gap-2">
        {([{ id: 'dark' as const, icon: Moon, label: 'Dunkel' }, { id: 'light' as const, icon: Sun, label: 'Hell' }, { id: 'system' as const, icon: Monitor, label: 'System' }]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => updateSettings({ theme: id })}
            className={cn('flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl', theme === id ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'text-muted')}>
            <Icon size={20} /><span className="text-xs">{label}</span>
          </button>
        ))}
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Gewohnheiten & Erinnerungen</h2>
      <Card className="mb-6 space-y-3">
        <div className="flex items-center gap-4 py-1">
          <Target size={20} className="text-emerald-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Morgen-Zusammenfassung (9:00)</p>
            <p className="text-xs text-muted">Offene Gewohnheiten für heute</p>
          </div>
          <button onClick={async () => {
            if (!data.settings.dailyReminder && 'Notification' in window) await Notification.requestPermission()
            updateSettings({ dailyReminder: !data.settings.dailyReminder })
          }} className={cn('w-12 h-7 rounded-full relative', data.settings.dailyReminder ? 'bg-emerald-500' : 'toggle-off')}>
            <div className={cn('w-5 h-5 rounded-full bg-white absolute top-1 transition-all', data.settings.dailyReminder ? 'left-6' : 'left-1')} />
          </button>
        </div>
        <div className="flex items-center gap-4 py-1">
          <Flame size={20} className="text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Streak-Warnung abends</p>
            <p className="text-xs text-muted">Wenn fällige Gewohnheiten noch offen sind</p>
          </div>
          <button onClick={() => updateSettings({ habitStreakReminder: !data.settings.habitStreakReminder })}
            className={cn('w-12 h-7 rounded-full relative', data.settings.habitStreakReminder ? 'bg-emerald-500' : 'toggle-off')}>
            <div className={cn('w-5 h-5 rounded-full bg-white absolute top-1 transition-all', data.settings.habitStreakReminder ? 'left-6' : 'left-1')} />
          </button>
        </div>
        {data.settings.habitStreakReminder && (
          <Input
            label="Abendliche Erinnerung (Stunde, 0–23)"
            type="number"
            min={17}
            max={23}
            value={String(data.settings.habitEveningReminderHour ?? 20)}
            onChange={e => updateSettings({ habitEveningReminderHour: Math.min(23, Math.max(17, parseInt(e.target.value) || 20)) })}
          />
        )}
        <p className="text-[10px] text-faint leading-relaxed">{localStorageHints.notifications} Einzelne Uhrzeiten pro Gewohnheit unter Gewohnheiten → Bearbeiten.</p>
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Essen & Finanzen</h2>
      <Card className="mb-6">
        <div className="flex items-center gap-4 py-1">
          <PiggyBank size={20} className="text-purple-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Einkauf ins Budget übernehmen</p>
            <p className="text-xs text-muted">Nach dem Abhaken aller Artikel Ausgabe anbieten</p>
          </div>
          <button
            onClick={() => updateSettings({ groceryBookToBudget: !data.settings.groceryBookToBudget })}
            className={cn('w-12 h-7 rounded-full relative', data.settings.groceryBookToBudget ? 'bg-emerald-500' : 'toggle-off')}
          >
            <div className={cn('w-5 h-5 rounded-full bg-white absolute top-1 transition-all', data.settings.groceryBookToBudget ? 'left-6' : 'left-1')} />
          </button>
        </div>
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Wellness & Timer</h2>
      <Card className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <Droplets size={18} className="text-cyan-400" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input label="Tagesziel Wasser (ml)" type="number" value={String(data.settings.waterGoalMl)} onChange={e => updateSettings({ waterGoalMl: parseInt(e.target.value) || 2500 })} />
            <Input label="Glasgröße (ml)" type="number" value={String(data.settings.waterGlassMl)} onChange={e => updateSettings({ waterGlassMl: parseInt(e.target.value) || 250 })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer size={18} className="text-emerald-400" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input label="Fokus (Min.)" type="number" value={String(data.settings.pomodoroWorkMin)} onChange={e => updateSettings({ pomodoroWorkMin: parseInt(e.target.value) || 25 })} />
            <Input label="Pause (Min.)" type="number" value={String(data.settings.pomodoroBreakMin)} onChange={e => updateSettings({ pomodoroBreakMin: parseInt(e.target.value) || 5 })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PiggyBank size={18} className="text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Spar-Challenge Basis (€/Woche 1)</p>
            <div className="flex gap-2">
            {[5, 10, 20, 25].map(inc => (
              <button key={inc} onClick={() => applySavingsIncrement(inc)}
                className={cn('px-3 py-1.5 rounded-xl text-sm', data.settings.savingsIncrement === inc ? 'bg-amber-500/20 text-amber-400' : 'glass')}>{inc}€</button>
            ))}
            </div>
          </div>
        </div>
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Abo & Konto</h2>
      <Card className="mb-6 space-y-3">
        {user && !isDemoUser(user) ? (
          <>
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-emerald-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">{getSubscriptionLabel(user.subscription.plan)}</p>
                {user.subscription.plan === 'trial' && (
                  <p className="text-xs text-muted">
                    Noch {getDaysRemaining(user) ?? 0} Tag{(getDaysRemaining(user) ?? 0) === 1 ? '' : 'e'} Testphase
                  </p>
                )}
                {(user.subscription.plan === 'monthly' || user.subscription.plan === 'yearly') && user.subscription.expiresAt && (
                  <p className="text-xs text-muted">
                    {user.subscription.cancelAtPeriodEnd ? 'Endet am' : 'Verlängert sich am'}{' '}
                    {new Date(user.subscription.expiresAt).toLocaleDateString('de-DE')}
                  </p>
                )}
                {user.subscription.plan === 'lifetime' && (
                  <p className="text-xs text-muted">Einmalzahlung – dauerhafter Zugang</p>
                )}
                {!hasActiveAccess(user) && (
                  <p className="text-xs text-amber-400">Zugang abgelaufen – bitte upgraden.</p>
                )}
              </div>
            </div>
            {(user.subscription.plan === 'trial' || user.subscription.plan === 'expired') && (
              <Link to="/registrieren/preise" className="block">
                <Button className="w-full" size="sm">
                  Upgrade – ab {formatPrice(pricing.lifetime.price)} einmalig
                </Button>
              </Link>
            )}
            {canCancelSubscription(user) && (
              <Button variant="secondary" className="w-full" size="sm" onClick={handleCancelAbo}>
                <XCircle size={16} /> Abo kündigen
              </Button>
            )}
            {user.subscription.cancelAtPeriodEnd && (
              <p className="text-xs text-center text-amber-400">Kündigung vorgemerkt – Zugang bis Periodenende.</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-faint justify-center pt-1">
              <Link to="/agb" className="link-muted">AGB</Link>
              <Link to="/datenschutz" className="link-muted">Datenschutz</Link>
              <Link to="/widerruf" className="link-muted">Widerruf</Link>
              <Link to="/impressum" className="link-muted">Impressum</Link>
            </div>
            <Button variant="danger" className="w-full" size="sm" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Konto löschen
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted text-center py-2">Demo-Modus – kein echtes Konto</p>
        )}
        {aboMsg && (
          <p className={cn('text-xs text-center', aboMsg.includes('vorgemerkt') || aboMsg.includes('gespeichert') ? 'text-emerald-400' : 'text-red-400')}>
            {aboMsg}
          </p>
        )}
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Hilfe</h2>
      <Card className="mb-6">
        <Link to="/support" className="flex items-center gap-3 py-1">
          <LifeBuoy size={18} className="text-cyan-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Support kontaktieren</p>
            <p className="text-xs text-muted">Fragen zu Abo, Technik oder Funktionen</p>
          </div>
        </Link>
      </Card>

      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Daten</h2>
      <p className="text-xs text-muted mb-2 leading-relaxed">{localStorageHints.backup}</p>
      <p className="text-xs text-muted mb-3 leading-relaxed">{localStorageHints.device}</p>
      <Card className="mb-6 space-y-3">
        <Button variant="secondary" className="w-full" onClick={handleExport}><Download size={16} /> JSON Backup exportieren</Button>
        <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}><Upload size={16} /> JSON Backup importieren</Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        {importMsg && <p className="text-xs text-center text-emerald-400">{importMsg}</p>}
        <Button variant="danger" className="w-full" onClick={resetData}><RotateCcw size={16} /> Alle Daten zurücksetzen</Button>
      </Card>

      <p className="text-center text-xs text-faint mt-8">{brand.name} v{brand.version}</p>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''} confirmLabel={opts?.confirmLabel}
        onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}