import { pricing } from '../config/pricing'
import { DEMO_EMAIL, DEMO_USER_ID } from './demoData'
import type { SubscriptionPlan, User, UserSubscription } from '../types'

export function defaultSubscription(): UserSubscription {
  return { plan: 'none' }
}

export function isDemoUser(user: User): boolean {
  return user.id === DEMO_USER_ID || user.email === DEMO_EMAIL || user.subscription?.plan === 'demo'
}

export function needsPlanSelection(user: User): boolean {
  if (isDemoUser(user)) return false
  return user.subscription?.plan === 'none'
}

function isSubscriptionActive(sub: UserSubscription): boolean {
  const now = new Date()

  switch (sub.plan) {
    case 'trial':
      return !!sub.trialEndsAt && now < new Date(sub.trialEndsAt)
    case 'lifetime':
    case 'demo':
      return true
    case 'monthly':
    case 'yearly':
      return !!sub.expiresAt && now < new Date(sub.expiresAt)
    default:
      return false
  }
}

export function resolveExpiredPlan(sub: UserSubscription): UserSubscription {
  if (!isSubscriptionActive(sub) && ['trial', 'monthly', 'yearly'].includes(sub.plan)) {
    return { ...sub, plan: 'expired' }
  }
  return sub
}

export function hasActiveAccess(user: User): boolean {
  if (isDemoUser(user)) return true
  const sub = resolveExpiredPlan(user.subscription ?? defaultSubscription())
  return isSubscriptionActive(sub)
}

export function startTrial(): UserSubscription {
  const now = new Date()
  const ends = new Date(now)
  ends.setDate(ends.getDate() + pricing.trialDays)
  return {
    plan: 'trial',
    trialStartedAt: now.toISOString(),
    trialEndsAt: ends.toISOString(),
  }
}

export function activatePlan(plan: 'lifetime' | 'monthly' | 'yearly'): UserSubscription {
  const now = new Date()
  const purchasedAt = now.toISOString()

  if (plan === 'lifetime') {
    return { plan: 'lifetime', purchasedAt }
  }

  const expires = new Date(now)
  if (plan === 'monthly') expires.setMonth(expires.getMonth() + 1)
  else expires.setFullYear(expires.getFullYear() + 1)

  return {
    plan,
    purchasedAt,
    expiresAt: expires.toISOString(),
    cancelAtPeriodEnd: false,
  }
}

export function cancelSubscription(sub: UserSubscription): UserSubscription {
  if (sub.plan !== 'monthly' && sub.plan !== 'yearly') return sub
  return {
    ...sub,
    cancelAtPeriodEnd: true,
    cancelledAt: new Date().toISOString(),
  }
}

const planLabels: Record<SubscriptionPlan, string> = {
  none: 'Kein Plan gewählt',
  trial: 'Kostenlose Testphase',
  lifetime: 'Einmalzahlung (Lebenslang)',
  monthly: 'Monatsabo',
  yearly: 'Jahresabo',
  expired: 'Abgelaufen',
  demo: 'Demo',
}

export function getSubscriptionLabel(plan: SubscriptionPlan): string {
  return planLabels[plan]
}

export function getDaysRemaining(user: User): number | null {
  const sub = user.subscription
  if (!sub) return null

  let end: string | undefined
  if (sub.plan === 'trial') end = sub.trialEndsAt
  else if (sub.plan === 'monthly' || sub.plan === 'yearly') end = sub.expiresAt

  if (!end) return null
  const diff = new Date(end).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function canCancelSubscription(user: User): boolean {
  const sub = user.subscription
  if (!sub || sub.cancelAtPeriodEnd) return false
  return sub.plan === 'monthly' || sub.plan === 'yearly'
}

export function migrateUser(user: User): User {
  let migrated: User = { ...user }

  if (!migrated.subscription) {
    migrated = { ...migrated, subscription: defaultSubscription() }
  }

  if (migrated.id === DEMO_USER_ID || migrated.email === DEMO_EMAIL) {
    migrated = { ...migrated, subscription: { plan: 'demo' } }
  }

  const resolved = resolveExpiredPlan(migrated.subscription)
  if (resolved.plan !== migrated.subscription.plan) {
    migrated = { ...migrated, subscription: resolved }
  }

  return migrated
}