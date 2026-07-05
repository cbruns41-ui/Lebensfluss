import { brand } from './brand'

/** Platzhalter – vor Go-Live mit echten Angaben ersetzen (§ 5 DDG). */
export const legalConfig = {
  appName: brand.name,
  companyName: '[Vor- und Nachname oder Firmenname]',
  legalForm: 'Einzelunternehmen',
  street: '[Straße Hausnummer]',
  zip: '[PLZ]',
  city: '[Stadt]',
  country: 'Deutschland',
  email: brand.contactEmail,
  phone: '',
  vatId: '',
  responsiblePerson: '[Name des Verantwortlichen für den Inhalt]',
  registerCourt: '',
  registerNumber: '',
  /** Frontend-Hosting */
  frontendHostingProvider: 'Vercel Inc.',
  frontendHostingLocation: 'USA (CDN weltweit, inkl. EU-Rechenzentren)',
  frontendHostingPrivacyUrl: 'https://vercel.com/legal/privacy-policy',
  /** API-Hosting */
  hostingProvider: 'Hetzner Online GmbH',
  hostingLocation: 'Deutschland (EU)',
  hostingPrivacyUrl: 'https://www.hetzner.com/de/legal/privacy-policy',
  /** Zahlungsdienstleister */
  paymentProvider: 'Stripe Payments Europe, Ltd.',
  paymentProviderLocation: 'Irland (EU); Verarbeitung teils mit Stripe Inc. (USA)',
  stripePrivacyUrl: 'https://stripe.com/de/privacy',
  stripeLegalUrl: 'https://stripe.com/de/legal',
  /** Aufsichtsbehörde (Beispiel – an Ihren Sitz anpassen) */
  supervisoryAuthority: '[Zuständige Landesdatenschutzbehörde]',
  supervisoryAuthorityUrl: 'https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html',
  /** Rechtstexte */
  legalLastUpdated: 'Juli 2026',
  contractLanguage: 'Deutsch',
} as const

export function formatAddress(): string {
  const { street, zip, city, country } = legalConfig
  return `${street}, ${zip} ${city}, ${country}`
}

export function formatContactBlock(): string {
  const c = legalConfig
  return `${c.companyName}, ${formatAddress()}, E-Mail: ${c.email}`
}