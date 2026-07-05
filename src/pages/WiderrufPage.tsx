import { LegalLayout } from '../components/legal/LegalLayout'
import { legalConfig, formatAddress } from '../config/legal'

export function WiderrufPage() {
  const c = legalConfig

  return (
    <LegalLayout title="Widerrufsbelehrung">
      <p className="text-faint text-xs">Stand: {c.legalLastUpdated}</p>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Widerrufsrecht für Verbraucher</h2>
        <p>
          Wenn Sie Verbraucher sind, haben Sie das Recht, binnen <strong className="text-slate-200">vierzehn Tagen</strong>{' '}
          ohne Angabe von Gründen diesen Vertrag zu widerrufen.
        </p>
        <p className="mt-2">
          Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p className="mt-2">
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
        </p>
        <p className="mt-2">
          {c.companyName}<br />
          {formatAddress()}<br />
          E-Mail: <a href={`mailto:${c.email}`} className="text-emerald-400 hover:underline">{c.email}</a>
        </p>
        <p className="mt-2">
          mittels einer eindeutigen Erklärung (z. B. per E-Mail oder über das Musterformular unten) über
          Ihren Entschluss informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden,
          das jedoch nicht vorgeschrieben ist.
        </p>
        <p className="mt-2">
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
          Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
          einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben),
          unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung
          über Ihren Widerruf bei uns eingegangen ist.
        </p>
        <p className="mt-2">
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
          eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Besonderheiten bei digitalen Inhalten (Einmalzahlung)</h2>
        <p>
          Bei der <strong className="text-slate-200">Einmalzahlung (Lifetime)</strong> handelt es sich um digitale
          Inhalte im Sinne des § 327 BGB, die nicht auf einem körperlichen Datenträger geliefert werden.
        </p>
        <p className="mt-2">
          Das Widerrufsrecht erlischt gemäß § 356 Abs. 5 BGB, wenn wir mit der Vertragserfüllung begonnen haben,
          nachdem Sie
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>ausdrücklich zugestimmt haben, dass wir mit der Ausführung vor Ablauf der Widerrufsfrist beginnen, und</li>
          <li>Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung Ihr Widerrufsrecht verlieren.</li>
        </ol>
        <p className="mt-2">
          Diese Zustimmung holen wir vor der Zahlung über eine separate, nicht vorausgewählte Checkbox ein.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Besonderheiten bei digitalen Dienstleistungen (Abo)</h2>
        <p>
          Bei <strong className="text-slate-200">Monats- und Jahresabos</strong> handelt es sich um fortlaufende
          digitale Dienstleistungen. Auch hier kann das Widerrufsrecht vorzeitig erlöschen, wenn Sie ausdrücklich
          zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen, und Sie bestätigt
          haben, dass Sie Ihr Widerrufsrecht mit Beginn der Leistung verlieren (§ 356 Abs. 5 BGB).
        </p>
        <p className="mt-2">
          <strong className="text-slate-200">Kündigung vs. Widerruf:</strong> Unabhängig vom Widerrufsrecht können
          Sie ein laufendes Abo jederzeit zum Ende der bezahlten Periode über das Stripe-Kundenportal kündigen
          (Einstellungen → Abo kündigen). Eine Kündigung beendet die Verlängerung, beendet aber nicht rückwirkend
          bereits erbrachte Leistungszeiträume.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Kostenlose Testphase</h2>
        <p>
          Während der kostenlosen Testphase ({' '}
          <a href="/agb" className="text-emerald-400 hover:underline">siehe AGB</a>
          ) fallen keine Zahlungen an. Ein Widerruf ist insoweit nicht erforderlich; Sie können die Testphase
          durch Nicht-Auswahl eines kostenpflichtigen Plans beenden.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Muster-Widerrufsformular</h2>
        <p className="text-faint text-xs mb-2">
          (Wenn Sie den Vertrag widerrufen wollen, füllen Sie dieses Formular aus und senden Sie es zurück.)
        </p>
        <div className="glass rounded-2xl p-5 mt-2 text-slate-400">
          <p>An</p>
          <p className="mt-1">{c.companyName}, {formatAddress()}, {c.email}:</p>
          <p className="mt-4">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Nutzung
            der App „{c.appName}“.
          </p>
          <p className="mt-3">Bestellt am (*): ____________</p>
          <p>Name des/der Verbraucher(s): ____________</p>
          <p>Anschrift des/der Verbraucher(s): ____________</p>
          <p>E-Mail-Adresse (Konto): ____________</p>
          <p className="mt-3">Datum, Unterschrift (nur bei Mitteilung auf Papier)</p>
          <p className="mt-4 text-faint text-xs">(*) Unzutreffendes streichen.</p>
        </div>
      </section>
    </LegalLayout>
  )
}