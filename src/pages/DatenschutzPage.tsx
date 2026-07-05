import { LegalLayout } from '../components/legal/LegalLayout'
import { legalConfig, formatAddress } from '../config/legal'

export function DatenschutzPage() {
  const c = legalConfig

  return (
    <LegalLayout title="Datenschutzerklärung">
      <p className="text-faint text-xs">Stand: {c.legalLastUpdated}</p>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO):
        </p>
        <p className="mt-2">
          {c.companyName}<br />
          {formatAddress()}<br />
          E-Mail: <a href={`mailto:${c.email}`} className="text-emerald-400 hover:underline">{c.email}</a>
          {c.phone && <><br />Telefon: {c.phone}</>}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">2. Kurzüberblick</h2>
        <p>
          {c.appName} ist eine Progressive Web App (PWA) zur persönlichen Organisation. Wir setzen auf{' '}
          <strong className="text-slate-200">lokale Speicherung</strong>: Ihre sensiblen Inhalte
          (Gewohnheiten, Finanzen, Tagebuch usw.) verlassen Ihr Gerät in der Regel nicht.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong className="text-slate-200">Lokal im Browser:</strong> Konto, App-Inhalte, Einstellungen</li>
          <li><strong className="text-slate-200">Auf unserem Server:</strong> nur Abo-Status, Support, News</li>
          <li><strong className="text-slate-200">Bei Stripe:</strong> Zahlungsabwicklung (Kartendaten nur bei Stripe)</li>
          <li><strong className="text-slate-200">Kein Marketing-Tracking</strong> über Analyse- oder Werbe-Cookies</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">3. Lokale Verarbeitung (App-Daten)</h2>
        <p>
          Folgende Daten werden <strong className="text-slate-200">ausschließlich lokal in Ihrem Browser</strong>{' '}
          (localStorage) gespeichert und nicht an uns übermittelt:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Registrierungsdaten (Name, E-Mail, Passwort – derzeit unverschlüsselt im Browser)</li>
          <li>App-Inhalte (Gewohnheiten, Budget, Tagebuch, Ziele, Einstellungen usw.)</li>
          <li>Sitzungsinformationen (Login-Status)</li>
          <li>Cookie-/Einwilligungshinweis (Zeitpunkt der Bestätigung)</li>
        </ul>
        <p className="mt-2">
          <strong className="text-slate-200">Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit. b DSGVO
          (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der technischen
          Bereitstellung der App).
        </p>
        <p className="mt-2">
          <strong className="text-slate-200">Speicherdauer:</strong> bis zur Löschung durch Sie, bis Sie Ihr
          Konto löschen oder bis der Browser-Speicher geleert wird.
        </p>
        <p className="mt-2">
          <strong className="text-slate-200">Hinweis:</strong> Sichern Sie Ihre Daten regelmäßig per JSON-Export
          in den Einstellungen. Bei Gerätewechsel oder Browser-Löschung können Daten verloren gehen.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">4. Server-Verarbeitung (Abo, Support, News)</h2>
        <p>
          Für Abo-Verwaltung, Support und öffentliche Neuigkeiten nutzen wir Server bei{' '}
          <strong className="text-slate-200">{c.hostingProvider}</strong> ({c.hostingLocation}).
          Dabei werden <em>keine</em> App-Inhalte übertragen.
        </p>

        <h3 className="text-base font-medium text-slate-200 mt-4 mb-2">4.1 Abo- und Lizenzdaten</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verarbeitete Daten: E-Mail, interne Nutzer-ID, gewählter Plan, Ablaufdatum, Stripe-Kunden-/Abo-Referenz</li>
          <li>Zweck: Vertragsdurchführung, Zugangskontrolle, Abrechnungsstatus</li>
          <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</li>
        </ul>

        <h3 className="text-base font-medium text-slate-200 mt-4 mb-2">4.2 Support-Anfragen</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verarbeitete Daten: Name, E-Mail, Betreff, Nachricht, optional Nutzer-ID, Zeitstempel</li>
          <li>Zweck: Bearbeitung Ihrer Anfrage</li>
          <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO bzw. lit. f DSGVO (Kundenservice)</li>
        </ul>

        <h3 className="text-base font-medium text-slate-200 mt-4 mb-2">4.3 Öffentliche News</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verarbeitete Daten: Titel, Inhalt, Veröffentlichungsdatum (keine personenbezogenen Nutzerdaten)</li>
          <li>Zweck: Information über Produktneuigkeiten</li>
          <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</li>
        </ul>

        <h3 className="text-base font-medium text-slate-200 mt-4 mb-2">4.4 Server-Logdaten</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verarbeitete Daten: IP-Adresse, Zeitstempel, aufgerufene URL, User-Agent, HTTP-Status</li>
          <li>Zweck: Betrieb, Sicherheit, Fehleranalyse</li>
          <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</li>
          <li>Speicherdauer: maximal 14 Tage, sofern keine längere Aufbewahrung zur Klärung von Vorfällen erforderlich ist</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">5. Zahlungsabwicklung (Stripe)</h2>
        <p>
          Für kostenpflichtige Pläne nutzen wir <strong className="text-slate-200">{c.paymentProvider}</strong>.
          Zahlungsdaten (z. B. Kreditkarte, IBAN) werden ausschließlich bei Stripe verarbeitet.
        </p>
        <p className="mt-2">Wir erhalten von Stripe insbesondere:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Transaktions- und Abo-Status</li>
          <li>Stripe-Kunden- und Abo-IDs</li>
          <li>Rechnungsbezogene Metadaten (keine vollständigen Kartendaten)</li>
        </ul>
        <p className="mt-2">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Datenschutzerklärung von Stripe:{' '}
          <a href={c.stripePrivacyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            {c.stripePrivacyUrl}
          </a>
        </p>
        <p className="mt-2">
          Stripe kann Daten in Länder außerhalb der EU (insb. USA) übermitteln. Stripe stützt sich hierfür
          auf geeignete Garantien (z. B. EU-Standardvertragsklauseln). Details entnehmen Sie der Stripe-Datenschutzerklärung.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">6. Auftragsverarbeiter (Art. 28 DSGVO)</h2>
        <p>Wir setzen folgende Dienstleister ein, die personenbezogene Daten in unserem Auftrag verarbeiten:</p>
        <div className="glass rounded-xl p-4 mt-3 space-y-3 text-sm">
          <div>
            <p className="font-medium text-slate-200">{c.hostingProvider}</p>
            <p>Hosting der API (PocketBase), Speicherort: {c.hostingLocation}</p>
            <a href={c.hostingPrivacyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-xs">
              Datenschutzerklärung Hetzner
            </a>
          </div>
          <div>
            <p className="font-medium text-slate-200">{c.paymentProvider}</p>
            <p>Zahlungsabwicklung, Standort: {c.paymentProviderLocation}</p>
            <a href={c.stripePrivacyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-xs">
              Datenschutzerklärung Stripe
            </a>
          </div>
        </div>
        <p className="mt-2">
          Mit allen Auftragsverarbeitern bestehen Verträge gemäß Art. 28 DSGVO (bzw. Stripe-Standardverträge).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">7. Cookies & lokale Speicherung (TTDSG)</h2>
        <p>
          Wir verwenden <strong className="text-slate-200">keine Marketing- oder Tracking-Cookies</strong>.
          Technisch notwendige Speicherung im Browser (localStorage) dient dem Login, der App-Funktion und der
          Speicherung Ihrer Einwilligung zum Hinweis-Banner. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TTDSG i. V. m.
          Art. 6 Abs. 1 lit. b und lit. f DSGVO.
        </p>
        <p className="mt-2">
          Beim Aufruf unserer Server können technisch bedingt kurzzeitig Verbindungsdaten (siehe Abschnitt 4.4)
          anfallen – ohne Profilbildung oder Werbe-Tracking.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">8. Datensicherheit</h2>
        <p>
          Wir treffen angemessene technische und organisatorische Maßnahmen (TOMs), u. a.:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>HTTPS-Verschlüsselung bei Serververbindungen</li>
          <li>Zugriffsbeschränkung auf Server-Daten (Lizenzen nur über gesicherte API)</li>
          <li>Minimierung der serverseitig gespeicherten Daten</li>
          <li>Stripe-Webhook-Signaturprüfung</li>
        </ul>
        <p className="mt-2">
          Absolute Sicherheit kann nicht garantiert werden. Bitte schützen Sie Ihr Gerät und Ihre Zugangsdaten.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">9. Keine automatisierte Entscheidungsfindung</h2>
        <p>
          Wir nutzen keine automatisierte Entscheidungsfindung oder Profiling im Sinne von Art. 22 DSGVO,
          das Ihnen gegenüber rechtliche oder ähnlich erhebliche Wirkung entfaltet.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">10. Minderjährige</h2>
        <p>
          Die App richtet sich an Personen ab 18 Jahren (bzw. mit Zustimmung der Erziehungsberechtigten).
          Wir erheben wissentlich keine Daten von Kindern unter 16 Jahren. Wenn Sie davon ausgehen, dass ein
          Kind uns Daten übermittelt hat, kontaktieren Sie uns – wir löschen diese umgehend.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">11. Ihre Rechte</h2>
        <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong className="text-slate-200">Auskunft</strong> (Art. 15 DSGVO)</li>
          <li><strong className="text-slate-200">Berichtigung</strong> (Art. 16 DSGVO)</li>
          <li><strong className="text-slate-200">Löschung</strong> (Art. 17 DSGVO) – auch über „Konto löschen“ in den Einstellungen</li>
          <li><strong className="text-slate-200">Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
          <li><strong className="text-slate-200">Datenübertragbarkeit</strong> (Art. 20 DSGVO) – JSON-Export für lokale App-Daten</li>
          <li><strong className="text-slate-200">Widerspruch</strong> (Art. 21 DSGVO) gegen Verarbeitung auf Basis von Art. 6 Abs. 1 lit. f DSGVO</li>
          <li><strong className="text-slate-200">Widerruf erteilter Einwilligungen</strong> (Art. 7 Abs. 3 DSGVO) mit Wirkung für die Zukunft</li>
        </ul>
        <p className="mt-2">
          Zur Ausübung Ihrer Rechte genügt eine Nachricht an:{' '}
          <a href={`mailto:${c.email}`} className="text-emerald-400 hover:underline">{c.email}</a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">12. Beschwerde bei einer Aufsichtsbehörde</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO),
          insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des
          mutmaßlichen Verstoßes.
        </p>
        <p className="mt-2">
          Zuständige Aufsichtsbehörde am Sitz des Anbieters:{' '}
          <strong className="text-slate-200">{c.supervisoryAuthority}</strong>. Übersicht aller Behörden:{' '}
          <a href={c.supervisoryAuthorityUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            bfdi.bund.de
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">13. Speicherdauer (Zusammenfassung)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-slate-200">Lokale App-Daten:</strong> bis Löschung durch Sie</li>
          <li><strong className="text-slate-200">Abo-/Lizenzdaten:</strong> bis Kontolöschung, ggf. länger bei gesetzlichen Aufbewahrungspflichten (Rechnungen: 10 Jahre)</li>
          <li><strong className="text-slate-200">Support-Tickets:</strong> bis Erledigung, maximal 3 Jahre</li>
          <li><strong className="text-slate-200">Server-Logs:</strong> maximal 14 Tage</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">14. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir passen diese Erklärung an, wenn sich unsere Verarbeitung oder rechtliche Anforderungen ändern.
          Die jeweils aktuelle Fassung ist unter dieser URL abrufbar. Bei wesentlichen Änderungen informieren
          wir registrierte Nutzer, sofern erforderlich, in der App oder per E-Mail.
        </p>
      </section>
    </LegalLayout>
  )
}