import type { AdminConfig, NewsItem, SupportTicket } from '../../types'
import {
  getPb, isPbAdmin, mapPbNews, mapPbTicket,
} from './pbClient'

export { isCloudEnabled, getPocketBaseUrl, pbAuthWithPassword, isPbAuthenticated, isPbAdmin } from './pbClient'
export { pbLogout } from './pbClient'

// ─── News (öffentlich lesbar) ───────────────────────────────────────────────

export async function fetchPublicNewsFromCloud(): Promise<NewsItem[]> {
  const pb = getPb()
  if (!pb) return []
  try {
    const result = await pb.collection('news').getList(1, 50, {
      sort: '-pinned,-publishedAt',
    })
    return result.items.map(mapPbNews)
  } catch {
    return []
  }
}

function isPbRecordId(id: string): boolean {
  return /^[a-z0-9]{15}$/i.test(id)
}

export async function syncNewsItemToCloud(
  input: Pick<NewsItem, 'title' | 'content' | 'pinned'> & { id?: string },
): Promise<NewsItem | null> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return null

  const body = {
    title: input.title,
    content: input.content,
    pinned: input.pinned ?? false,
    publishedAt: new Date().toISOString(),
  }

  try {
    const record = input.id && isPbRecordId(input.id)
      ? await pb.collection('news').update(input.id, body)
      : await pb.collection('news').create(body)
    return mapPbNews(record)
  } catch {
    return null
  }
}

export async function deleteNewsFromCloud(id: string): Promise<void> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return
  try {
    await pb.collection('news').delete(id)
  } catch { /* ignore */ }
}

// ─── Site-Config (Support-E-Mails) ────────────────────────────────────────────

export async function fetchAdminConfigFromCloud(): Promise<AdminConfig | null> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return null
  try {
    const record = await pb.collection('site_config').getFirstListItem('key="default"')
    const emails = Array.isArray(record.supportEmails) ? record.supportEmails as string[] : []
    return { supportEmails: emails }
  } catch {
    return null
  }
}

export async function syncAdminConfigToCloud(config: AdminConfig): Promise<void> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return
  try {
    const existing = await pb.collection('site_config').getList(1, 1, {
      filter: 'key="default"',
    })
    const body = { key: 'default', supportEmails: config.supportEmails }
    if (existing.items.length > 0) {
      await pb.collection('site_config').update(existing.items[0].id, body)
    } else {
      await pb.collection('site_config').create(body)
    }
  } catch { /* lokal gespeichert */ }
}

// ─── Support-Tickets ─────────────────────────────────────────────────────────

export async function fetchSupportTicketsFromCloud(): Promise<SupportTicket[]> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return []
  try {
    const result = await pb.collection('support_tickets').getList(1, 100, {
      sort: '-created',
    })
    return result.items.map(mapPbTicket)
  } catch {
    return []
  }
}

export async function sendSupportTicketToCloud(
  ticket: SupportTicket,
  emails: string[],
): Promise<boolean> {
  const pb = getPb()
  if (!pb) return false
  try {
    await pb.collection('support_tickets').create({
      userName: ticket.userName,
      userEmail: ticket.userEmail,
      userId: ticket.userId ?? '',
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      notifyEmails: emails.join(','),
    })
    return true
  } catch {
    return false
  }
}

export async function updateTicketStatusInCloud(
  id: string,
  status: SupportTicket['status'],
): Promise<void> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return
  try {
    await pb.collection('support_tickets').update(id, { status })
  } catch { /* ignore */ }
}

export async function deleteTicketFromCloud(id: string): Promise<void> {
  const pb = getPb()
  if (!pb || !isPbAdmin()) return
  try {
    await pb.collection('support_tickets').delete(id)
  } catch { /* ignore */ }
}

// Lizenzen: siehe src/lib/license.ts und pocketbase/pb_hooks/stripe.pb.js