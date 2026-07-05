/// <reference path="../pb_data/types.d.ts" />

/**
 * Benachrichtigt Support-E-Mails bei neuer Kundenanfrage.
 * SMTP in PocketBase Admin → Settings → Mail konfigurieren.
 */
onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const app = e.app

  let recipients = []
  if (record.get('notifyEmails')) {
    recipients = String(record.get('notifyEmails')).split(',').map(s => s.trim()).filter(Boolean)
  }

  if (recipients.length === 0) {
    try {
      const config = app.findRecordsByFilter('site_config', 'key = "default"', 1, 0)
      if (config.length > 0) {
        const emails = config[0].get('supportEmails')
        if (Array.isArray(emails)) recipients = emails
      }
    } catch (_) { /* site_config noch nicht angelegt */ }
  }

  if (recipients.length === 0) return

  const subject = `[Lebensfluss Support] ${record.get('subject')}`
  const html = `
    <h2>Neue Support-Anfrage</h2>
    <p><strong>Von:</strong> ${record.get('userName')} (${record.get('userEmail')})</p>
    <p><strong>Betreff:</strong> ${record.get('subject')}</p>
    <hr>
    <pre style="font-family:sans-serif;white-space:pre-wrap">${record.get('message')}</pre>
  `

  const mailClient = app.newMailClient()
  for (const address of recipients) {
    try {
      mailClient.send({
        from: { address: $os.getenv('PB_SUPPORT_FROM') || 'noreply@lebensfluss.de', name: 'Lebensfluss' },
        to: [{ address }],
        subject,
        html,
      })
    } catch (err) {
      console.error('Support-Mail fehlgeschlagen:', address, err)
    }
  }
}, 'support_tickets')