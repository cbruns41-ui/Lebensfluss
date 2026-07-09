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
  backup: 'Exportiere regelmäßig ein JSON-Backup – deine App-Daten liegen nur in diesem Browser.',
  device: 'Neues Handy oder anderer Browser: Hier exportieren → dort unter Einstellungen importieren → mit derselben E-Mail anmelden. Dein Abo wird per E-Mail wiedererkannt, die App-Inhalte kommen aus dem Backup.',
  privacy: 'Gewohnheiten, Finanzen und Tagebuch verlassen dein Gerät nicht – DSGVO-freundlich by design.',
  notifications: 'Erinnerungen funktionieren am zuverlässigsten, wenn die App installiert ist und im Hintergrund offen bleibt. Im Browser-Tab können Hinweise verpasst werden.',
} as const