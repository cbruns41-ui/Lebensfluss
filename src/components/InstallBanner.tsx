import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-banner-dismissed') === 'true',
  )

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
    if (!dismissed && !isStandalone) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [dismissed])

  const handleInstall = async () => {
    const prompt = window.deferredPrompt
    if (prompt) {
      await prompt.prompt()
      setShow(false)
    }
  }

  const dismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top px-4 pt-3">
      <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-2xl border-emerald-500/30 slide-up max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Download size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Als App installieren</p>
          <p className="text-xs text-muted">Ohne App Store – direkt aufs Handy</p>
        </div>
        <button onClick={handleInstall} className="text-xs font-medium text-emerald-400 shrink-0">
          Installieren
        </button>
        <button onClick={dismiss} className="text-faint shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}