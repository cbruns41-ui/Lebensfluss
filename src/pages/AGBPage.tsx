import { LegalLayout } from '../components/legal/LegalLayout'
import { legalConfig, formatAddress } from '../config/legal'
import { pricing, formatPrice } from '../config/pricing'

export function AGBPage() {
  const c = legalConfig

  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="text-faint text-xs">Stand: {c.legalLastUpdated}</p>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 1 Geltungsbereich, Vertragspartner & Verbraucher</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen („AGB“) gelten für alle Verträge zwischen{' '}
          <strong className="text-slate-200">{c.companyName}</strong> ({c.legalForm}, {formatAddress()})
          – nachfolgend „Anbieter“ – und Ihnen als Nutzerin oder Nutzer über die Nutzung der App „{c.appName}“.
        </p>
        <p className="mt-2">
          Maßgeblich ist die zum Zeitpunkt der Registrierung bzw. des Vertragsschlusses abrufbare Fassung.
          Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer
          Geltung ausdrücklich schriftlich zu.
        </p>
        <p className="mt-2">
          Verbraucher im Sinne dieser AGB sind natürliche Personen, die den Vertrag zu Zwecken abschließen,
          die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet
          werden können (§ 13 BGB). Unternehmer im Sinne des § 14 BGB sind alle übrigen Nutzer.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 2 Vertragsgegenstand</h2>
        <p>
          {c.appName} ist eine webbasierte Progressive Web App (PWA) zur persönlichen Organisation. Der
          Leistungsumfang umfasst insbesondere Gewohnheits-Tracking, Budgetverwaltung, Wellness-Erfassung,
          Tagebuch, Essensplanung, Ziele, Statistiken und weitere Module, wie sie in der App zum Zeitpunkt
          des Vertragsschlusses beschrieben sind.
        </p>
        <p className="mt-2">
          Der Anbieter schuldet die Bereitstellung der Software in der jeweils aktuellen Version. Ein
          bestimmter Erfolg (z. B. finanzielle, gesundheitliche oder persönliche Ziele) wird nicht geschuldet.
          Die App ersetzt keine steuerliche, medizinische, psychologische oder sonstige professionelle Beratung.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 3 Vertragsschluss & Registrierung</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Die Darstellung der App und der Tarife auf der Website stellt kein bindendes Angebot dar, sondern
            eine Einladung zur Abgabe eines Angebots durch den Nutzer.
          </li>
          <li>
            Mit der Registrierung und Auswahl eines Nutzungsplans (Testphase, Einmalzahlung oder Abo) geben Sie
            ein verbindliches Angebot ab. Der Vertrag kommt mit Freischaltung des gewählten Zugangs zustande.
          </li>
          <li>
            Sie müssen mindestens 18 Jahre alt sein oder die Zustimmung eines Erziehungsberechtigten haben.
            Pro Person ist in der Regel ein Konto vorgesehen.
          </li>
          <li>
            Sie sind verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen und Ihre
            Zugangsdaten geheim zu halten. Sie haften für Aktivitäten über Ihr Konto, soweit Sie diese zu
            vertreten haben.
          </li>
          <li>
            Sie können Ihr Konto jederzeit in den Einstellungen löschen. Vorher wird ein JSON-Export empfohlen.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 4 Nutzungsmodelle & Preise</h2>
        <p>Folgende Modelle werden angeboten:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong className="text-slate-200">Kostenlose Testphase:</strong> {pricing.trialDays} Tage voller
            Funktionsumfang ohne Zahlungsdaten, danach ist ein kostenpflichtiger Plan erforderlich.
          </li>
          <li>
            <strong className="text-slate-200">Einmalzahlung (Lifetime):</strong> {formatPrice(pricing.lifetime.price)} –
            dauerhafte Nutzungsberechtigung für die zum Kaufzeitpunkt aktuelle Hauptversion der App.
          </li>
          <li>
            <strong className="text-slate-200">Monatsabo:</strong> {formatPrice(pricing.monthly.price)}/Monat,
            monatlich kündbar.
          </li>
          <li>
            <strong className="text-slate-200">Jahresabo:</strong> {formatPrice(pricing.yearly.price)}/Jahr,
            jährlich kündbar.
          </li>
        </ul>
        <p className="mt-2">
          Alle Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer, sofern anwendbar. Maßgeblich ist
          der zum Zeitpunkt des Vertragsschlusses angezeigte Preis.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 5 Zahlung</h2>
        <p>
          Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister{' '}
          <strong className="text-slate-200">{c.paymentProvider}</strong> (Stripe). Zahlungsdaten
          (z. B. Kreditkarte) werden ausschließlich bei Stripe verarbeitet. Der Anbieter erhält nur
          Transaktions- und Abo-Status (z. B. Zahlungsreferenz, Plan, Laufzeit).
        </p>
        <p className="mt-2">
          Es gelten ergänzend die Bedingungen von Stripe:{' '}
          <a href={c.stripeLegalUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            {c.stripeLegalUrl}
          </a>
        </p>
        <p className="mt-2">
          Bei Zahlungsverzug oder fehlgeschlagenen Abbuchungen kann der Zugang bis zur erfolgreichen Zahlung
          gesperrt werden.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 6 Laufzeit, Kündigung & Widerruf</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-slate-200">Testphase:</strong> endet automatisch nach {pricing.trialDays} Tagen,
            sofern kein kostenpflichtiger Plan gewählt wird.
          </li>
          <li>
            <strong className="text-slate-200">Einmalzahlung:</strong> unbefristete Nutzungsberechtigung ohne
            Abo-Verlängerung. Eine „Kündigung“ im Abo-Sinne entfällt.
          </li>
          <li>
            <strong className="text-slate-200">Monats-/Jahresabo:</strong> Kündigung jederzeit zum Ende der
            laufenden Abrechnungsperiode über das Stripe-Kundenportal (Einstellungen → Abo kündigen). Der
            Zugang bleibt bis zum Periodenende bestehen.
          </li>
        </ul>
        <p className="mt-2">
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Details, Ausnahmen bei digitalen Inhalten
          und Dienstleistungen sowie das Muster-Widerrufsformular finden Sie in unserer{' '}
          <a href="/widerruf" className="text-emerald-400 hover:underline">Widerrufsbelehrung</a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 7 Verfügbarkeit, Datenspeicherung & Backup</h2>
        <p>
          Alle persönlichen App-Inhalte (Gewohnheiten, Budget, Tagebuch, Einstellungen usw.) werden
          ausschließlich lokal in Ihrem Browser gespeichert. Es gibt keinen Cloud-Sync dieser Inhalte.
        </p>
        <p className="mt-2">
          Auf Servern in {c.hostingLocation} ({c.hostingProvider}) werden nur Abo-Status, Support-Anfragen
          und öffentliche News verarbeitet – nicht Ihre App-Inhalte. Details:{' '}
          <a href="/datenschutz" className="text-emerald-400 hover:underline">Datenschutzerklärung</a>.
        </p>
        <p className="mt-2">
          <strong className="text-slate-200">Backup-Pflicht des Nutzers:</strong> Sie sind selbst dafür
          verantwortlich, Ihre Daten regelmäßig per JSON-Export zu sichern. Bei Gerätewechsel, Browser-Löschung
          oder technischen Defekten können lokale Daten unwiederbringlich verloren gehen. Der Anbieter
          übernimmt hierfür keine Haftung, soweit gesetzlich zulässig.
        </p>
        <p className="mt-2">
          Der Anbieter bemüht sich um hohe Verfügbarkeit, schuldet jedoch keine ununterbrochene
          Erreichbarkeit (z. B. bei Wartung, Updates oder höherer Gewalt).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 8 Nutzungsrechte & Pflichten</h2>
        <p>
          Der Anbieter räumt Ihnen ein einfaches, nicht übertragbares, nicht unterlizenzierbares Recht ein,
          die App für private Zwecke im Rahmen des gewählten Plans zu nutzen.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Keine Weitergabe von Zugangsdaten an Dritte</li>
          <li>Kein Reverse Engineering, keine automatisierte Auslesung (Scraping) der App</li>
          <li>Keine rechtswidrigen, beleidigenden oder fremdrechtsverletzenden Inhalte</li>
          <li>Keine Nutzung, die die Infrastruktur übermäßig belastet oder die App für andere stört</li>
        </ul>
        <p className="mt-2">
          Bei Verstößen kann der Anbieter den Zugang sperren oder kündigen, soweit dies nach billigem Ermessen
          erforderlich ist.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 9 Gewährleistung & Haftung</h2>
        <p>
          Es gelten die gesetzlichen Gewährleistungsrechte. Bei digitalen Inhalten und Dienstleistungen gelten
          die Regelungen der §§ 327 ff. BGB, soweit anwendbar.
        </p>
        <p className="mt-2">
          Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben,
          Körper oder Gesundheit. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten
          (Kardinalpflichten) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
          Im Übrigen ist die Haftung – soweit gesetzlich zulässig – ausgeschlossen.
        </p>
        <p className="mt-2">
          Für Datenverlust haftet der Anbieter nur, wenn Sie zum Verlust beigetragen haben und keine
          angemessene Datensicherung (JSON-Backup) vorgenommen wurde.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 10 Änderungen der Leistung & AGB</h2>
        <p>
          Der Anbieter darf die App weiterentwickeln und Funktionen anpassen, sofern dies für den Nutzer
          zumutbar ist und der vertragliche Kernzweck erhalten bleibt.
        </p>
        <p className="mt-2">
          Änderungen dieser AGB werden Ihnen in Textform mitgeteilt. Widersprechen Sie nicht innerhalb von
          30 Tagen nach Zugang, gelten die Änderungen als angenommen. Auf diese Folge werden Sie in der
          Mitteilung gesondert hingewiesen. Bei wesentlichen Nachteilen steht Ihnen ein Sonderkündigungsrecht zu.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 11 Streitbeilegung, Sprache & anwendbares Recht</h2>
        <p>
          Vertragssprache ist {c.contractLanguage}. Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
          Bei Verbrauchern mit gewöhnlichem Aufenthalt in der EU bleiben zwingende Verbraucherschutzvorschriften
          des Aufenthaltsstaates unberührt.
        </p>
        <p className="mt-2">
          Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
        <p className="mt-2">
          Gerichtsstand für Kaufleute, juristische Personen des öffentlichen Rechts und öffentlich-rechtliche
          Sondervermögen ist – soweit zulässig – der Sitz des Anbieters.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">§ 12 Schlussbestimmungen</h2>
        <p>
          Sollten einzelne Bestimmungen unwirksam sein oder werden, bleibt der Vertrag im Übrigen wirksam.
          An die Stelle der unwirksamen Regelung tritt eine wirksame, die dem wirtschaftlichen Zweck am
          nächsten kommt.
        </p>
        <p className="mt-2">
          Kontakt: <a href={`mailto:${c.email}`} className="text-emerald-400 hover:underline">{c.email}</a>
        </p>
      </section>
    </LegalLayout>
  )
}