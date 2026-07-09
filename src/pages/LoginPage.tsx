import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, FlaskConical } from 'lucide-react'
import { LogoMark } from '../components/brand/Logo'
import { useAuth } from '../contexts/AuthContext'
import { isAdminEmail } from '../lib/admin'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LegalFooter } from '../components/legal/LegalFooter'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, register, loginAsDemo } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const err = mode === 'login'
      ? login(email, password)
      : register(name, email, password)
    if (err) setError(err)
    else if (mode === 'register') navigate('/registrieren/preise')
    else navigate(isAdminEmail(email) ? '/admin' : '/app')
  }

  return (
    <div className="min-h-dvh flex flex-col safe-top page-bg">
      <div className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2 link-muted text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <LogoMark size="lg" className="mx-auto mb-4 glow-accent" />
            <h1 className="text-2xl font-bold mb-2">
              {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
            </h1>
            <p className="text-muted text-sm">
              {mode === 'login'
                ? 'Melde dich an – dein Konto liegt nur in diesem Browser (kein Cloud-Login nötig).'
                : 'Registriere dich lokal – danach wählst du Testphase oder Plan.'}
            </p>
            {mode === 'login' && (
              <p className="text-xs text-faint mt-3 max-w-sm mx-auto leading-relaxed">
                Kein Konto auf diesem Gerät? Zuerst unter „Jetzt registrieren“ anlegen.
                Nach dem Login ggf. auf der nächsten Seite die Testphase starten (AGB-Haken setzen).
              </p>
            )}
            {mode === 'login' && isAdminEmail(email) && (
              <p className="text-xs text-emerald-400/90 mt-2">
                Admin-Zugang → nach dem Login gelangst du in den News-Bereich.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
            {mode === 'register' && (
              <Input label="Name" placeholder="Dein Name" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <Input label="E-Mail" type="email" placeholder="name@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="relative">
              <Input
                label="Passwort"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-faint hover:text-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              {mode === 'login' ? 'Anmelden' : 'Registrieren'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            {mode === 'login' ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {mode === 'login' ? 'Jetzt registrieren' : 'Anmelden'}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t divider">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => { loginAsDemo(); navigate('/app') }}
            >
              <FlaskConical size={16} /> Ohne Login – Demo starten
            </Button>
          </div>

          <LegalFooter className="mt-8 border-none" />
        </div>
      </div>
    </div>
  )
}