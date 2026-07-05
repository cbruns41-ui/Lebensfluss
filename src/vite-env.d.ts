/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL?: string
  readonly VITE_APP_URL?: string
  readonly VITE_STRIPE_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface Window {
  deferredPrompt?: BeforeInstallPromptEvent
}