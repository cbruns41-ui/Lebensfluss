import type { PaidPlanId } from '../config/pricing'
import { getPb, isCloudEnabled } from './api/pbClient'

/** Stripe Checkout aktiv (Server + Frontend-Flag). */
export function isStripeCheckoutAvailable(): boolean {
  return isCloudEnabled() && import.meta.env.VITE_STRIPE_ENABLED === 'true'
}

/** Dev-Modus: lokale Zahlungssimulation wenn Stripe aus. */
export function isPaymentSimulationAllowed(): boolean {
  return import.meta.env.DEV && !isStripeCheckoutAvailable()
}

export async function createCheckoutSession(input: {
  plan: PaidPlanId
  email: string
  localUserId: string
  acceptedTermsAt: string
  acceptedPrivacyAt: string
}): Promise<string | null> {
  const pb = getPb()
  if (!pb) return null
  try {
    const res = await pb.send<{ url?: string }>('/api/lebensfluss/stripe/checkout', {
      method: 'POST',
      body: input,
    })
    return res.url ?? null
  } catch {
    return null
  }
}

export async function createPortalSession(email: string, localUserId: string): Promise<string | null> {
  const pb = getPb()
  if (!pb) return null
  try {
    const res = await pb.send<{ url?: string }>('/api/lebensfluss/stripe/portal', {
      method: 'POST',
      body: { email, localUserId },
    })
    return res.url ?? null
  } catch {
    return null
  }
}