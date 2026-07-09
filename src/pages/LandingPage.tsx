import { Link, useNavigate } from 'react-router-dom'
import {
  Target, Wallet, PiggyBank, UtensilsCrossed, CalendarDays, Flag,
  Smartphone, Sparkles, CheckCircle2, ArrowRight, Zap, FlaskConical,
  Droplets, BookOpen, Timer, BarChart3, Award, Shield, Sun, ShoppingCart,
  Share2, Construction,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../lib/admin'
import { pricing, formatPrice } from '../config/pricing'
import { NewsFeed } from '../components/NewsFeed'
import { Logo, LogoMark } from '../components/brand/Logo'
import { siteNotice } from '../config/legal'


const features = [
  { icon: Sparkles, title: 'Life Score', desc: 'Eine Zahl zeigt dir, wie gut deine Woche läuft — aus Gewohnheiten, Wellness, Budget, Fokus und Reflexion.', color: 'emerald' },
  { icon: Sun, title: 'Sonntags-Ritual', desc: 'Jeden Sonntag in wenigen Minuten: Was lief gut? Worauf legst du diese Woche Wert? Essen & Geld kurz checken.', color: 'amber' },
  { icon: Target, title: 'Gewohnheiten', desc: 'Täglich abhaken, Streaks sehen, Erinnerungen bekommen — z. B. für Sport, Lesen oder früh aufstehen.', color: 'emerald' },
  { icon: Flag, title: 'Ziele', desc: 'Setz dir Ziele mit Deadline. Wenn du deine Gewohnheiten einträgst, siehst du automatisch, wie weit du schon bist.', color: 'pink' },
  { icon: Droplets, title: 'Wellness', desc: 'Wie viel hast du getrunken? Wie war die Stimmung? Wie gut hast du geschlafen? Alles auf einen Blick.', color: 'cyan' },
  { icon: Wallet, title: 'Budget', desc: 'Einnahmen und Ausgaben eintragen — sieh sofort, wo dein Geld hingeht und was noch übrig ist.', color: 'blue' },
  { icon: PiggyBank, title: 'Spar-Challenge', desc: 'Die beliebte 52-Wochen-Methode: Jede Woche ein bisschen mehr sparen — Schritt für Schritt zum Ziel.', color: 'amber' },
  { icon: UtensilsCrossed, title: 'Essen planen', desc: 'Rezepte sammeln und die Woche durchplanen. Die App erstellt dir daraus automatisch die Einkaufsliste.', color: 'purple' },
  { icon: ShoppingCart, title: 'Einkaufsliste', desc: 'Alles auf einer Liste zum Abhaken — im Laden große Schrift, damit du schnell findest, was du brauchst.', color: 'purple' },
  { icon: Timer, title: 'Fokus-Timer', desc: 'Konzentriert arbeiten oder lernen — Timer starten, Pause machen, fertig. Wie Pomodoro, nur für dich einstellbar.', color: 'indigo' },
  { icon: BookOpen, title: 'Tagebuch', desc: 'Gedanken aufschreiben, Dankbarkeit üben oder kurz notieren, was dir wichtig ist.', color: 'rose' },
  { icon: CalendarDays, title: 'Monatsplaner', desc: 'Aufgaben für den Monat sortieren — nach Wochen und Wichtigkeit, mit Platz für Notizen.', color: 'cyan' },
  { icon: BarChart3, title: 'Statistik', desc: 'Sieh, wie sich deine Woche, dein Monat und dein Jahr entwickelt — mit übersichtlichen Verläufen.', color: 'purple' },
  { icon: Share2, title: 'Wochenrückblick teilen', desc: 'Deine Woche als Text speichern oder mit Freundin, Freund oder Coach teilen.', color: 'indigo' },
  { icon: Award, title: 'Erfolge', desc: 'Sammle Abzeichen, wenn du dranbleibst — kleine Belohnungen, die motivieren.', color: 'amber' },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
  purple: 'bg-purple-500/15 text-purple-400',
  indigo: 'bg-indigo-500/15 text-indigo-400',
  rose: 'bg-rose-500/15 text-rose-400',
  pink: 'bg-pink-500/15 text-pink-400',
  teal: 'bg-teal-500/15 text-teal-400',
}

export function LandingPage() {
  const { user, loginAsDemo } = useAuth()
  const navigate = useNavigate()

  const handleDemo = () => {
    loginAsDemo()
    navigate('/app')
  }

  return (
    <div className="min-h-dvh page-bg">
      <header className="relative overflow-hidden safe-top">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

        <nav className="relative flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {isAdmin(user) && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">Admin</Button>
              </Link>
            )}
            <Link to={isAdmin(user) ? '/admin' : '/login'}>
              <Button variant="secondary" size="sm">
                {isAdmin(user) ? 'News verwalten' : 'Anmelden'}
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative px-6 max-w-6xl mx-auto mb-6" role="note" aria-label={siteNotice.title}>
          <div className="glass rounded-2xl border border-amber-500/35 bg-amber-500/8 p-4 sm:p-5 flex gap-3 sm:gap-4 items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Construction size={20} className="text-amber-400" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-amber-400 mb-1.5">{siteNotice.title}</p>
              <p className="text-sm text-muted leading-relaxed">{siteNotice.body}</p>
            </div>
          </div>
        </div>

        <section className="relative px-6 pt-2 pb-20 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-emerald-400 mb-6">
            <Zap size={14} />
            {pricing.trialDays} Tage gratis testen · Auf Deutsch · Fürs Handy gemacht
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
            Dein Leben.<br />
            <span className="gradient-text">Im Fluss.</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Gewohnheiten erfassen, Geld im Blick behalten, Essen für die Woche planen und jeden Sonntag wissen,
            worauf du dich diese Woche konzentrierst. Eine App für deinen Alltag — verständlich, auf Deutsch,
            ohne Technik-Gerede.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Jetzt starten <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={handleDemo}>
              <FlaskConical size={18} /> Demo testen
            </Button>
            <a href="#news">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Neuigkeiten
              </Button>
            </a>
            <a href="#features">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Alle Features
              </Button>
            </a>
          </div>
          <p className="text-xs text-faint mt-4">
            „Demo testen" geht ohne Anmeldung — mit Beispieldaten zum Ausprobieren.
          </p>

          <div className="mt-16 mx-auto max-w-sm">
            <div className="glass rounded-[2.5rem] p-3 glow-accent">
              <div className="bg-slate-900 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <LogoMark size="sm" />
                  <span className="font-semibold text-sm">Lebensfluss</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Life Score</span>
                  <span className="text-emerald-400 text-sm font-medium">78 · Stark</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-muted">
                  {[
                    { e: '💪', l: 'Sport' },
                    { e: '🛒', l: 'Einkauf' },
                    { e: '☀️', l: 'Sonntag' },
                    { e: '📊', l: 'Score' },
                  ].map(({ e, l }) => (
                    <div key={l} className="bg-slate-800/80 rounded-xl p-2">
                      <div className="text-lg mb-0.5">{e}</div>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      <NewsFeed />

      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Was du alles kannst</h2>
          <p className="text-muted max-w-xl mx-auto">
            Statt fünf verschiedene Apps: Gewohnheiten, Geld, Essen, Planung und Rückblick — alles an einem Ort.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass rounded-2xl p-6 hover:border-emerald-500/20 transition-all group">
              <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">So startest du die Woche</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            {[
              { step: '1', title: 'Sonntag', text: 'Kurz zurückblicken und festlegen, worauf du dich diese Woche fokussierst' },
              { step: '2', title: 'Essen planen', text: 'Woche durchdenken, Einkaufsliste erstellen, einkaufen gehen' },
              { step: '3', title: 'Unter der Woche', text: 'Gewohnheiten abhaken, Geld eintragen, Wasser & Schlaf notieren' },
              { step: '4', title: 'Freitag/Samstag', text: 'Woche reflektieren — und auf Wunsch mit anderen teilen' },
            ].map(({ step, title, text }) => (
              <div key={step} className="text-center sm:text-left">
                <span className="inline-flex w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm items-center justify-center mb-2">{step}</span>
                <p className="font-medium mb-1">{title}</p>
                <p className="text-muted text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
          <div className="relative">
            <Smartphone size={48} className="mx-auto text-emerald-400 mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Aufs Handy legen — wie eine normale App</h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Kein App Store, kein Download-Stress. Einfach im Browser öffnen und auf den Home-Bildschirm legen — fertig.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              {['iPhone: Teilen → Zum Home-Bildschirm', 'Android: Menü → App installieren', 'Hell- oder Dunkelmodus nach Wunsch'].map(tip => (
                <div key={tip} className="flex items-center gap-2 glass rounded-xl px-4 py-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Bereit?</h2>
        <p className="text-muted mb-2">
          {pricing.trialDays} Tage kostenlos testen – danach ab {formatPrice(pricing.lifetime.price)} einmalig oder Abo.
        </p>
        <p className="text-faint text-sm mb-4 flex items-center justify-center gap-2">
          <Shield size={14} className="text-emerald-400/60" />
          DSGVO-konform · Deine Daten bleiben auf deinem Gerät
        </p>
        <p className="text-xs text-muted max-w-md mx-auto mb-8 leading-relaxed">
          <Construction size={12} className="inline text-amber-400 mr-1 -mt-0.5" aria-hidden />
          {siteNotice.title}: Derzeit keine kommerzielle Nutzung — Preisangaben sind Vorschau.
        </p>
        <Link to="/login">
          <Button size="lg">
            Kostenlos registrieren <ArrowRight size={18} />
          </Button>
        </Link>
      </section>

      <LegalFooter className="border-t divider" />
    </div>
  )
}