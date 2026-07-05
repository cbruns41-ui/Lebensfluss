import { LegalLayout } from '../components/legal/LegalLayout'
import { legalConfig, formatAddress } from '../config/legal'

export function ImpressumPage() {
  const c = legalConfig

  return (
    <LegalLayout title="Impressum">
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Angaben gemäß § 5 DDG</h2>
        <p>
          {c.companyName}<br />
          {c.legalForm && <>{c.legalForm}<br /></>}
          {formatAddress()}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${c.email}`} className="text-emerald-400 hover:underline">{c.email}</a>
          {c.phone && <><br />Telefon: {c.phone}</>}
        </p>
      </section>

      {c.vatId && (
        <section>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {c.vatId}</p>
        </section>
      )}

      {(c.registerCourt || c.registerNumber) && (
        <section>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Registereintrag</h2>
          <p>
            {c.registerCourt && <>Registergericht: {c.registerCourt}<br /></>}
            {c.registerNumber && <>Registernummer: {c.registerNumber}</>}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>{c.responsiblePerson}<br />{formatAddress()}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Umsatzsteuer</h2>
        <p>
          {c.vatId
            ? <>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {c.vatId}</>
            : 'Sofern keine Umsatzsteuer-Identifikationsnummer angegeben ist, wird die Kleinunternehmerregelung nach § 19 UStG in Betracht gezogen oder die USt-IdNr. wird nachgereicht.'}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </LegalLayout>
  )
}