/**
 * Lokale Speicherung (Local-First)
 *
 * Alle persönlichen App-Inhalte (Gewohnheiten, Budget, Tagebuch, …) bleiben
 * ausschließlich im Browser (localStorage). Es gibt keinen Cloud-Sync für Nutzerdaten.
 *
 * Server (PocketBase, optional): nur News, Support-Tickets und Lizenz/Abo-Status
 * (E-Mail + Zahlungsstatus) – niemals App-Inhalte.
 */
export const storagePolicy = {
  /** App-Daten werden nur lokal gespeichert */
  localOnly: true,
  /** Kein Upload von Gewohnheiten, Budget, Tagebuch usw. */
  cloudSyncForAppData: false,
  /** Server speichert nur Abo/Lizenz-Metadaten (E-Mail, Plan, Ablaufdatum) */
  serverStoresLicenseOnly: true,
} as const

export const localStorageHints = {
  backup: 'Exportiere regelmäßig ein JSON-Backup in den Einstellungen – deine Daten liegen nur auf diesem Gerät.',
  device: 'Beim Wechsel auf ein neues Gerät: Backup exportieren, dort importieren. Dein Abo wird über die E-Mail-Adresse wiedererkannt.',
  privacy: 'Gewohnheiten, Finanzen und Tagebuch verlassen dein Gerät nicht – DSGVO-freundlich by design.',
} as const