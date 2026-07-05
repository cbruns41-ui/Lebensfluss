import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USER_ID } from '../config/admin'
import type { User } from '../types'

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  return user.role === 'admin' || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export function ensureAdminUser(users: User[]): User[] {
  const lifetime = { plan: 'lifetime' as const, purchasedAt: new Date().toISOString() }
  const idx = users.findIndex(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())

  if (idx < 0) {
    return [...users, {
      id: ADMIN_USER_ID,
      name: 'Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      createdAt: new Date().toISOString(),
      role: 'admin',
      subscription: lifetime,
    }]
  }

  const updated = [...users]
  updated[idx] = {
    ...updated[idx],
    role: 'admin',
    password: ADMIN_PASSWORD,
    subscription: updated[idx].subscription?.plan === 'none' ? lifetime : updated[idx].subscription,
  }
  return updated
}