import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

const CONSENT_KEY = 'lifeorganizer_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 safe-bottom pointer-events-none">
      <div className="max-w-lg mx-auto glass rounded-2xl p-4 shadow-xl pointer-events-auto">
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          Wir verwenden <strong className="text-slate-200">keine Marketing- oder Tracking-Cookies</strong>.
          Technisch notwendige Speicherung im Browser (localStorage) dient Login, App-Funktion und diesem Hinweis
          (§ 25 TTDSG).{' '}
          <Link to="/datenschutz" className="text-emerald-400 hover:underline">Datenschutzerklärung</Link>
        </p>
        <Button size="sm" className="w-full" onClick={accept}>Verstanden</Button>
      </div>
    </div>
  )
}