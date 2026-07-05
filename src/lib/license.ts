import type { User, UserSubscription } from '../types'
import { getPb, isCloudEnabled } from './api/pbClient'
import { resolveExpiredPlan } from './subscription'

/**
 * Lizenz-Modell (Login + Bezahlung)
 *
 * 1. Konto & App-Daten: lokal im Browser (localStorage)
 * 2. Bezahlung: Stripe Checkout → Webhook schreibt nur Abo-Status auf den Server (E-Mail + Plan)
 * 3. Login: lokale Anmeldung; Abo-Status vom Server abgleichen (E-Mail + localUserId)
 * 4. Neues Gerät: Backup importieren + mit gleicher E-Mail anmelden → Abo wird vom Server geholt
 */

export async function syncLicenseToServerIfEnabled(_user: User): Promise<void> {
  // Bezahlte Lizenzen werden ausschließlich per Stripe-Webhook geschrieben.
}

export async function refreshLicenseFromServer(user: User): Promise<User | null> {
  if (!isCloudEnabled()) return null

  const pb = getPb()
  if (!pb) return null

  try {
    const res = await pb.send<{
      found: boolean
      email?: string
      subscription?: UserSubscription
      acceptedTermsAt?: string
      acceptedPrivacyAt?: string
    }>('/api/lebensfluss/license/refresh', {
      method: 'POST',
      body: { email: user.email, localUserId: user.id },
    })

    if (!res.found || !res.subscription) return null

    const remoteSub = resolveExpiredPlan(res.subscription)
    const localSub = resolveExpiredPlan(user.subscription)

    if (JSON.stringify(localSub) === JSON.stringify(remoteSub)
      && user.acceptedTermsAt === res.acceptedTermsAt
      && user.acceptedPrivacyAt === res.acceptedPrivacyAt) {
      return null
    }

    return {
      ...user,
      subscription: remoteSub,
      acceptedTermsAt: res.acceptedTermsAt || user.acceptedTermsAt,
      acceptedPrivacyAt: res.acceptedPrivacyAt || user.acceptedPrivacyAt,
    }
  } catch {
    return null
  }
}

export async function deleteLicenseOnServer(email: string, localUserId: string): Promise<void> {
  const pb = getPb()
  if (!pb) return
  try {
    await pb.send('/api/lebensfluss/license/delete', {
      method: 'POST',
      body: { email, localUserId },
    })
  } catch { /* ignore */ }
}