import { useState } from 'react'
import { Target, Droplets, Wallet, ArrowRight } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from './ui/Button'
import { LogoMark } from './brand/Logo'

const steps = [
  {
    logo: true as const,
    title: 'Willkommen bei Lebensfluss!',
    desc: 'Dein persönlicher Hub für Gewohnheiten, Finanzen, Wellness und mehr – alles auf Deutsch, alles auf deinem Gerät.',
  },
  {
    icon: Target,
    title: 'Gewohnheiten aufbauen',
    desc: 'Nutze die 31-Tage-Übersicht und baue dauerhafte Routinen auf. Wähle aus Vorlagen oder erstelle eigene Gewohnheiten.',
  },
  {
    icon: Droplets,
    title: 'Wellness dokumentieren',
    desc: 'Erfasse Wasser, Stimmung und Schlaf. Schreibe Tagebuch, nutze den Fokus-Timer und sammle Erfolge.',
  },
  {
    icon: Wallet,
    title: 'Finanzen & Meal Prep',
    desc: 'Budget mit Daueraufträgen, Spar-Challenge und Meal Prep: Woche planen → Einkaufsliste automatisch. Dein Life Score zeigt den Gesamtfortschritt.',
  },
]

export function OnboardingModal() {
  const { data, updateData } = useData()
  const [step, setStep] = useState(0)

  if (data.settings.onboardingCompleted) return null

  const finish = () => {
    updateData(prev => ({
      ...prev,
      settings: { ...prev.settings, onboardingCompleted: true },
    }))
  }

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md glass rounded-3xl p-8 text-center slide-up">
        <div className="flex items-center justify-center mx-auto mb-6">
          {'logo' in current ? (
            <LogoMark size="xl" className="glow-accent" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <current.icon size={32} className="text-emerald-400" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold mb-3">{current.title}</h2>
        <p className="text-sm text-muted leading-relaxed mb-8">{current.desc}</p>

        <div className="flex gap-1.5 justify-center mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-[var(--toggle-off)]'}`} />
          ))}
        </div>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="w-full" size="lg">
            Weiter <ArrowRight size={18} />
          </Button>
        ) : (
          <Button onClick={finish} className="w-full" size="lg">
            Los geht's! 🚀
          </Button>
        )}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="text-sm text-muted mt-3 hover:text-[var(--text-primary)]">
            Zurück
          </button>
        )}
        <button onClick={finish} className="block mx-auto text-xs text-faint mt-4 hover:text-muted">
          Überspringen
        </button>
      </div>
    </div>
  )
}