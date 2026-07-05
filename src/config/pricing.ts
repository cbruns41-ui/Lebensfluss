export const pricing = {
  trialDays: 7,
  currency: 'EUR',
  lifetime: {
    id: 'lifetime' as const,
    price: 79.99,
    label: 'Einmalzahlung',
    headline: 'Lebenslang nutzen',
    description: 'Einmal zahlen, dauerhaft alle Features – Daten bleiben auf deinem Gerät.',
    badge: 'Empfohlen',
  },
  monthly: {
    id: 'monthly' as const,
    price: 4.99,
    label: 'Monatlich',
    headline: 'Flexibles Abo',
    description: 'Monatlich kündbar – App-Daten lokal, Abo-Status serverseitig.',
  },
  yearly: {
    id: 'yearly' as const,
    price: 39.99,
    label: 'Jährlich',
    headline: 'Jahresabo',
    description: 'Spare gegenüber dem Monatsabo – gleicher lokaler Datenschutz.',
    savingsLabel: '~33 % sparen',
  },
}

export type PaidPlanId = typeof pricing.lifetime.id | typeof pricing.monthly.id | typeof pricing.yearly.id

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: pricing.currency }).format(amount)
}