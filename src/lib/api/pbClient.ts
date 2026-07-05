import PocketBase, { type RecordModel } from 'pocketbase'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL ?? ''

let client: PocketBase | null = null

export function isCloudEnabled(): boolean {
  return PB_URL.length > 0
}

export function getPocketBaseUrl(): string {
  return PB_URL
}

export function getPb(): PocketBase | null {
  if (!isCloudEnabled()) return null
  if (!client) {
    client = new PocketBase(PB_URL)
    client.autoCancellation(false)
  }
  return client
}

export function isPbAuthenticated(): boolean {
  return getPb()?.authStore.isValid ?? false
}

export function getPbUserRole(): string | null {
  const model = getPb()?.authStore.record as RecordModel | null
  return (model?.role as string) ?? null
}

export function isPbAdmin(): boolean {
  return isPbAuthenticated() && getPbUserRole() === 'admin'
}

export async function pbAuthWithPassword(email: string, password: string): Promise<boolean> {
  const pb = getPb()
  if (!pb) return false
  try {
    await pb.collection('users').authWithPassword(email, password)
    return pb.authStore.record?.role === 'admin'
  } catch {
    pb.authStore.clear()
    return false
  }
}

export function pbLogout(): void {
  getPb()?.authStore.clear()
}

export function mapPbNews(record: RecordModel) {
  return {
    id: record.id,
    title: String(record.title ?? ''),
    content: String(record.content ?? ''),
    publishedAt: String(record.publishedAt ?? record.created ?? ''),
    updatedAt: String(record.updated ?? record.publishedAt ?? ''),
    pinned: Boolean(record.pinned),
  }
}

export function mapPbTicket(record: RecordModel) {
  return {
    id: record.id,
    userId: record.userId ? String(record.userId) : undefined,
    userName: String(record.userName ?? ''),
    userEmail: String(record.userEmail ?? ''),
    subject: String(record.subject ?? ''),
    message: String(record.message ?? ''),
    createdAt: String(record.created ?? ''),
    status: (record.status === 'closed' ? 'closed' : 'open') as 'open' | 'closed',
  }
}