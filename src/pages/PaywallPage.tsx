import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Crown, Clock, Shield, ArrowLeft, Trash2, LifeBuoy } from 'lucide-react'
import { LogoMark } from '../components/brand/Logo'
import { useAuth } from '../contexts/AuthContext'
import { pricing, formatPrice, type PaidPlanId } from '../config/pricing'
import { cn } from '../lib/utils'
import { localStorageHints } from '../config/storage'
import { isStripeCheckoutAvailable, isPaymentSimulationAllowed } from '../lib/stripe'

export function PaywallPage() {
  const { user, selectPlan, completeCheckout, deleteAccount, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isExpired = searchParams.get('expired') === '1'
  const checkoutStatus = searchParams.get('checkout')
  const checkoutHandled = useRef(false)
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [acceptedEarlyPerformance, setAcceptedEarlyPerformance] = useState(false)
  const [processing, setProcessing] = useState<PaidPlanId | 'trial' | null>(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, user, navigate])

  useEffect(() => {
    if (loading || !user || checkoutHandled.current) return
    if (checkoutStatus !== 'success') return
    checkoutHandled.current = true

    void (async () => {
      setError('')
      setProcessing('lifetime')
      const err = await completeCheckout()
      setProcessing(null)
      if (err) setError(err)
      else navigate('/app', { replace: true })
    })()
  }, [loading, user, checkoutStatus, completeCheckout, navigate])

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSelect = async (plan: PaidPlanId | 'trial') => {
    if (!acceptedLegal) {
      setError('Bitte akzeptiere die AGB und bestätige die Datenschutzerklärung.')
      return
    }
    if (plan !== 'trial' && !acceptedEarlyPerformance) {
      setError('Bitte stimme dem sofortigen Leistungsbeginn und dem Erlöschen des Widerrufsrechts zu.')
      return
    }
    setError('')
    setProcessing(plan)
    const err = await selectPlan(plan)
    setProcessing(null)
    if (err) setError(err)
    else if (plan === 'trial' || !isStripeCheckoutAvailable()) navigate('/app', { replace: true })
  }

  const paidPlans = [pricing.lifetime, pricing.monthly, pricing.yearly]

  return (
    <div className="min-h-dvh flex flex-col safe-top page-bg">
      <div className="px-6 py-5">
        <Link to={isExpired ? '/' : '/login'} className="inline-flex items-center gap-2 link-muted text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <div className="flex-1 px-6 pb-12 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <LogoMark size="lg" className="mx-auto mb-4 glow-accent" />
          <h1 className="text-2xl font-bold mb-2">
            {isExpired ? 'Testphase abgelaufen' : 'Wähle deinen Plan'}
          </h1>
          <p className="text-muted text-sm">
            {checkoutStatus === 'success'
              ? 'Zahlung erfolgreich – dein Zugang wird freigeschaltet…'
              : checkoutStatus === 'cancel'
                ? 'Zahlung abgebrochen. Du kannst es jederzeit erneut versuchen.'
                : isExpired
                  ? 'Upgrade jetzt, um Lebensfluss weiter zu nutzen.'
                  : `Starte ${pricing.trialDays} Tage kostenlos – oder sichere dir sofort Vollzugang.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelect('trial')}
          disabled={!!processing}
          className="w-full glass rounded-2xl p-5 mb-4 text-left hover:border-emerald-500/30 border border-transparent transition-all disabled:opacity-50"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Kostenlos testen</h3>
                <span className="text-emerald-400 font-bold">0 €</span>
              </div>
              <p className="text-sm text-muted mt-1">{pricing.trialDays} Tage voller Zugriff, keine Kreditkarte nötig.</p>
            </div>
          </div>
          {processing === 'trial' && <p className="text-xs text-emerald-400 mt-3 text-center">Wird aktiviert…</p>}
        </button>

        <p className="text-xs text-faint text-center mb-4 uppercase tracking-wider">Oder direkt freischalten</p>

        <div className="space-y-3 mb-6">
          {paidPlans.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelect(plan.id)}
              disabled={!!processing}
              className={cn(
                'w-full glass rounded-2xl p-5 text-left border transition-all disabled:opacity-50',
                'id' in plan && plan.id === 'lifetime' ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-transparent hover:border-slate-600',
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  plan.id === 'lifetime' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400',
                )}>
                  {plan.id === 'lifetime' ? <Crown size={20} /> : <Shield size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.headline}</h3>
                      {'badge' in plan && plan.badge && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {plan.badge}
                        </span>
                      )}
                      {'savingsLabel' in plan && plan.savingsLabel && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          {plan.savingsLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {formatPrice(plan.price)}
                      {plan.id !== 'lifetime' && <span className="text-xs text-muted font-normal">/{plan.id === 'monthly' ? 'Mo.' : 'Jahr'}</span>}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">{plan.description}</p>
                  <ul className="mt-2 space-y-1">
                    {['Alle Features', 'Daten bleiben lokal auf deinem Gerät', plan.id === 'lifetime' ? 'Einmal zahlen, für immer nutzen' : 'Jederzeit kündbar'].map(f => (
                      <li key={f} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-400" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {processing === plan.id && (
                <p className="text-xs text-emerald-400 mt-3 text-center">
                  {isStripeCheckoutAvailable() ? 'Weiterleitung zu Stripe…' : 'Zahlung wird simuliert…'}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <label className="flex items-start gap-3 glass rounded-xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={e => setAcceptedLegal(e.target.checked)}
              className="mt-1 accent-emerald-500"
            />
            <span className="text-xs text-slate-400 leading-relaxed">
              Ich akzeptiere die{' '}
              <Link to="/agb" target="_blank" className="text-emerald-400 hover:underline">AGB</Link>
              {' '}und habe die{' '}
              <Link to="/datenschutz" target="_blank" className="text-emerald-400 hover:underline">Datenschutzerklärung</Link>
              {' '}zur Kenntnis genommen. Die{' '}
              <Link to="/widerruf" target="_blank" className="text-emerald-400 hover:underline">Widerrufsbelehrung</Link>
              {' '}habe ich gelesen.
            </span>
          </label>
          <label className="flex items-start gap-3 glass rounded-xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedEarlyPerformance}
              onChange={e => setAcceptedEarlyPerformance(e.target.checked)}
              className="mt-1 accent-emerald-500"
            />
            <span className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Nur für kostenpflichtige Pläne:</strong> Ich verlange ausdrücklich,
              dass mit der Ausführung des Vertrags (Freischaltung der App) vor Ablauf der Widerrufsfrist begonnen wird.
              Mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere (§ 356 Abs. 5 BGB).
            </span>
          </label>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5 mb-4">{error}</p>
        )}

        <p className="text-center text-xs text-faint max-w-md mx-auto leading-relaxed">
          {localStorageHints.privacy}{' '}
          {isStripeCheckoutAvailable()
            ? 'Zahlung sicher über Stripe – nur Abo-Status auf dem Server.'
            : isPaymentSimulationAllowed()
              ? 'Entwicklungsmodus: Zahlungen werden simuliert.'
              : 'Online-Zahlung wird bald freigeschaltet.'}
        </p>

        {isExpired && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <p className="text-xs text-muted text-center">
              Kein Upgrade gewünscht? Du kannst dein Konto jederzeit löschen (DSGVO Art. 17).
            </p>
            <Link
              to="/support"
              className="flex items-center justify-center gap-2 w-full glass rounded-xl py-3 text-sm text-muted hover:text-emerald-400 transition-colors"
            >
              <LifeBuoy size={16} /> Support kontaktieren
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!window.confirm('Konto und alle Daten unwiderruflich löschen?')) return
                setDeleting(true)
                const err = await deleteAccount()
                setDeleting(false)
                if (err) setError(err)
                else navigate('/', { replace: true })
              }}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} /> Konto löschen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}