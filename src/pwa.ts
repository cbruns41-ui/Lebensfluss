import { registerSW } from 'virtual:pwa-register'

export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPrompt = e as BeforeInstallPromptEvent
  })

  registerSW({ immediate: true })
}