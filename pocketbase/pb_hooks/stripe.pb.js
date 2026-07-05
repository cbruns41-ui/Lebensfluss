/// <reference path="../pb_data/types.d.ts" />

/**
 * Stripe Checkout, Customer Portal & Webhooks.
 * Schreibt NUR in die licenses-Collection – keine App-Inhalte.
 *
 * Env (PocketBase / docker-compose):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_LIFETIME, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY
 *   APP_URL (z. B. https://lebensfluss.de)
 */

function stripeKey() {
  const key = $os.getenv('STRIPE_SECRET_KEY')
  if (!key) throw new BadRequestError('Stripe ist nicht konfiguriert.')
  return key
}

function appUrl() {
  return ($os.getenv('APP_URL') || 'http://localhost:5173').replace(/\/$/, '')
}

function priceIdForPlan(plan) {
  const map = {
    lifetime: $os.getenv('STRIPE_PRICE_LIFETIME'),
    monthly: $os.getenv('STRIPE_PRICE_MONTHLY'),
    yearly: $os.getenv('STRIPE_PRICE_YEARLY'),
  }
  const id = map[plan]
  if (!id) throw new BadRequestError('Unbekannter Plan oder Preis-ID fehlt.')
  return id
}

function formEncode(fields) {
  const parts = []
  for (const key in fields) {
    const val = fields[key]
    if (val === undefined || val === null || val === '') continue
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)))
  }
  return parts.join('&')
}

function stripePost(path, fields) {
  const res = $http.send({
    method: 'POST',
    url: 'https://api.stripe.com/v1/' + path,
    headers: {
      Authorization: 'Bearer ' + stripeKey(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formEncode(fields),
    timeout: 30,
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    console.error('Stripe API error:', res.statusCode, res.raw)
    throw new BadRequestError('Stripe-Anfrage fehlgeschlagen.')
  }
  return res.json
}

function stripeGet(path) {
  const res = $http.send({
    method: 'GET',
    url: 'https://api.stripe.com/v1/' + path,
    headers: { Authorization: 'Bearer ' + stripeKey() },
    timeout: 30,
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    console.error('Stripe API error:', res.statusCode, res.raw)
    throw new BadRequestError('Stripe-Anfrage fehlgeschlagen.')
  }
  return res.json
}

function isoFromUnix(sec) {
  if (!sec) return ''
  return new Date(sec * 1000).toISOString()
}

function buildPaidSubscription(plan, opts) {
  const now = new Date().toISOString()
  if (plan === 'lifetime') {
    return { plan: 'lifetime', purchasedAt: now }
  }
  return {
    plan,
    purchasedAt: now,
    expiresAt: opts.expiresAt || '',
    cancelAtPeriodEnd: !!opts.cancelAtPeriodEnd,
    cancelledAt: opts.cancelledAt || undefined,
  }
}

function upsertLicense(app, data) {
  const email = String(data.email || '').toLowerCase().trim()
  if (!email) return

  const collection = app.findCollectionByNameOrId('licenses')
  let records = []
  try {
    records = app.findRecordsByFilter('licenses', 'email = {:email}', 1, 0, { email })
  } catch (_) { /* collection fehlt */ }

  let record
  if (records.length > 0) {
    record = records[0]
  } else {
    record = new Record(collection)
    record.set('email', email)
  }

  if (data.localUserId) record.set('localUserId', data.localUserId)
  if (data.subscription) record.set('subscription', data.subscription)
  if (data.acceptedTermsAt) record.set('acceptedTermsAt', data.acceptedTermsAt)
  if (data.acceptedPrivacyAt) record.set('acceptedPrivacyAt', data.acceptedPrivacyAt)
  if (data.stripeCustomerId) record.set('stripeCustomerId', data.stripeCustomerId)
  if (data.stripeSubscriptionId) record.set('stripeSubscriptionId', data.stripeSubscriptionId)
  record.set('updatedAt', new Date().toISOString())

  app.save(record)
}

function findLicenseByEmail(app, email) {
  const records = app.findRecordsByFilter('licenses', 'email = {:email}', 1, 0, {
    email: email.toLowerCase().trim(),
  })
  return records.length > 0 ? records[0] : null
}

function verifyStripeEvent(e) {
  const secret = $os.getenv('STRIPE_WEBHOOK_SECRET')
  if (!secret) throw new BadRequestError('Webhook nicht konfiguriert.')

  const header = e.request.header.get('Stripe-Signature') || ''
  const rawBody = toString(e.request.body)

  let timestamp = ''
  const signatures = []
  header.split(',').forEach(part => {
    const idx = part.indexOf('=')
    if (idx < 0) return
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k === 't') timestamp = v
    if (k === 'v1') signatures.push(v)
  })

  if (!timestamp || signatures.length === 0) {
    throw new BadRequestError('Ungültige Stripe-Signatur.')
  }

  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)
  if (age > 300) throw new BadRequestError('Webhook-Zeitstempel abgelaufen.')

  const expected = $security.hs256(timestamp + '.' + rawBody, secret)
  let valid = false
  for (let i = 0; i < signatures.length; i++) {
    if ($security.equal(expected, signatures[i])) valid = true
  }
  if (!valid) throw new BadRequestError('Stripe-Signatur ungültig.')

  return JSON.parse(rawBody)
}

function handleCheckoutCompleted(app, session) {
  const plan = session.metadata?.plan
  const email = (session.customer_email || session.metadata?.email || '').toLowerCase()
  const localUserId = session.metadata?.localUserId || ''
  if (!plan || !email) return

  let subscription = buildPaidSubscription(plan, {})
  if (session.subscription) {
    try {
      const sub = stripeGet('subscriptions/' + session.subscription)
      subscription = buildPaidSubscription(plan, {
        expiresAt: isoFromUnix(sub.current_period_end),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
    } catch (_) { /* checkout.session.completed reicht als Fallback */ }
  }

  upsertLicense(app, {
    email,
    localUserId,
    subscription,
    acceptedTermsAt: session.metadata?.acceptedTermsAt || '',
    acceptedPrivacyAt: session.metadata?.acceptedPrivacyAt || '',
    stripeCustomerId: session.customer || '',
    stripeSubscriptionId: session.subscription || '',
  })
}

function findLicenseByStripeCustomer(app, customerId) {
  if (!customerId) return null
  try {
    const records = app.findRecordsByFilter(
      'licenses',
      'stripeCustomerId = {:customerId}',
      1,
      0,
      { customerId },
    )
    return records.length > 0 ? records[0] : null
  } catch (_) {
    return null
  }
}

function handleSubscriptionChange(app, sub) {
  let email = (sub.metadata?.email || '').toLowerCase()
  let plan = sub.metadata?.plan || ''
  let localUserId = sub.metadata?.localUserId || ''

  if (!email) {
    const byCustomer = findLicenseByStripeCustomer(app, sub.customer || '')
    if (byCustomer) {
      email = byCustomer.get('email')
      if (!localUserId) localUserId = byCustomer.get('localUserId') || ''
      const existing = byCustomer.get('subscription')
      if (!plan && existing?.plan) plan = existing.plan
    }
  }

  if (!email) return

  const status = sub.status
  let subscription
  if (status === 'active' || status === 'trialing') {
    subscription = buildPaidSubscription(plan || 'monthly', {
      expiresAt: isoFromUnix(sub.current_period_end),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelledAt: sub.canceled_at ? isoFromUnix(sub.canceled_at) : undefined,
    })
  } else {
    subscription = { plan: 'expired' }
  }

  upsertLicense(app, {
    email,
    localUserId,
    subscription,
    stripeCustomerId: sub.customer || '',
    stripeSubscriptionId: sub.id || '',
  })
}

// ─── Checkout-Session erstellen ─────────────────────────────────────────────

routerAdd('POST', '/api/lebensfluss/stripe/checkout', (e) => {
  const data = new DynamicModel({
    plan: '',
    email: '',
    localUserId: '',
    acceptedTermsAt: '',
    acceptedPrivacyAt: '',
  })
  e.bindBody(data)

  const plan = String(data.plan || '').trim()
  const email = String(data.email || '').toLowerCase().trim()
  const localUserId = String(data.localUserId || '').trim()

  if (!email || !localUserId) throw new BadRequestError('E-Mail und Nutzer-ID erforderlich.')
  if (!['lifetime', 'monthly', 'yearly'].includes(plan)) {
    throw new BadRequestError('Ungültiger Plan.')
  }

  const base = appUrl()
  const isSub = plan === 'monthly' || plan === 'yearly'
  const fields = {
    mode: isSub ? 'subscription' : 'payment',
    customer_email: email,
    success_url: base + '/registrieren/preise?checkout=success',
    cancel_url: base + '/registrieren/preise?checkout=cancel',
    'line_items[0][price]': priceIdForPlan(plan),
    'line_items[0][quantity]': '1',
    'metadata[plan]': plan,
    'metadata[email]': email,
    'metadata[localUserId]': localUserId,
    'metadata[acceptedTermsAt]': String(data.acceptedTermsAt || ''),
    'metadata[acceptedPrivacyAt]': String(data.acceptedPrivacyAt || ''),
    allow_promotion_codes: 'true',
    billing_address_collection: 'auto',
    locale: 'de',
  }

  if (isSub) {
    fields['subscription_data[metadata][plan]'] = plan
    fields['subscription_data[metadata][email]'] = email
    fields['subscription_data[metadata][localUserId]'] = localUserId
  }

  const session = stripePost('checkout/sessions', fields)
  return e.json(200, { url: session.url })
})

// ─── Customer Portal (Kündigung / Zahlungsmethode) ───────────────────────────

routerAdd('POST', '/api/lebensfluss/stripe/portal', (e) => {
  const data = new DynamicModel({
    email: '',
    localUserId: '',
  })
  e.bindBody(data)

  const email = String(data.email || '').toLowerCase().trim()
  const localUserId = String(data.localUserId || '').trim()
  if (!email || !localUserId) throw new BadRequestError('E-Mail und Nutzer-ID erforderlich.')

  const license = findLicenseByEmail(e.app, email)
  if (!license) throw new NotFoundError('Keine Lizenz gefunden.')

  const storedUserId = license.get('localUserId')
  if (storedUserId && storedUserId !== localUserId) {
    throw new ForbiddenError('Lizenz gehört zu einem anderen Gerät.')
  }

  const customerId = license.get('stripeCustomerId')
  if (!customerId) throw new BadRequestError('Kein Stripe-Kunde – nur Simulation oder Einmalzahlung.')

  const portal = stripePost('billing_portal/sessions', {
    customer: customerId,
    return_url: appUrl() + '/app/einstellungen',
  })

  return e.json(200, { url: portal.url })
})

// ─── Lizenz abrufen (E-Mail + localUserId) ──────────────────────────────────

routerAdd('POST', '/api/lebensfluss/license/refresh', (e) => {
  const data = new DynamicModel({
    email: '',
    localUserId: '',
  })
  e.bindBody(data)

  const email = String(data.email || '').toLowerCase().trim()
  const localUserId = String(data.localUserId || '').trim()
  if (!email || !localUserId) throw new BadRequestError('E-Mail und Nutzer-ID erforderlich.')

  const license = findLicenseByEmail(e.app, email)
  if (!license) return e.json(200, { found: false })

  const storedUserId = license.get('localUserId')
  if (storedUserId && storedUserId !== localUserId) {
    throw new ForbiddenError('Lizenz ist einem anderen Konto zugeordnet.')
  }

  if (!storedUserId) {
    license.set('localUserId', localUserId)
    e.app.save(license)
  }

  return e.json(200, {
    found: true,
    email: license.get('email'),
    subscription: license.get('subscription'),
    acceptedTermsAt: license.get('acceptedTermsAt') || '',
    acceptedPrivacyAt: license.get('acceptedPrivacyAt') || '',
  })
})

// ─── Konto-Löschung: Lizenz entfernen ───────────────────────────────────────

routerAdd('POST', '/api/lebensfluss/license/delete', (e) => {
  const data = new DynamicModel({
    email: '',
    localUserId: '',
  })
  e.bindBody(data)

  const email = String(data.email || '').toLowerCase().trim()
  const localUserId = String(data.localUserId || '').trim()
  if (!email || !localUserId) throw new BadRequestError('E-Mail und Nutzer-ID erforderlich.')

  const license = findLicenseByEmail(e.app, email)
  if (!license) return e.json(200, { deleted: false })

  const storedUserId = license.get('localUserId')
  if (storedUserId && storedUserId !== localUserId) {
    throw new ForbiddenError('Lizenz gehört zu einem anderen Gerät.')
  }

  e.app.delete(license)
  return e.json(200, { deleted: true })
})

// ─── Stripe Webhook ─────────────────────────────────────────────────────────

routerAdd('POST', '/api/lebensfluss/stripe/webhook', (e) => {
  const event = verifyStripeEvent(e)
  const app = e.app

  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(app, event.data.object)
      break
    case 'customer.subscription.updated':
      handleSubscriptionChange(app, event.data.object)
      break
    case 'customer.subscription.deleted':
      handleSubscriptionChange(app, { ...event.data.object, status: 'canceled' })
      break
    case 'invoice.paid': {
      const inv = event.data.object
      if (inv.subscription) {
        const sub = stripeGet('subscriptions/' + inv.subscription)
        handleSubscriptionChange(app, sub)
      }
      break
    }
    default:
      break
  }

  return e.json(200, { received: true })
})