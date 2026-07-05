import type { AdminConfig } from '../types'
import { DEFAULT_SUPPORT_EMAILS } from '../config/admin'
import { fetchAdminConfigFromCloud, syncAdminConfigToCloud, isCloudEnabled, isPbAdmin } from './api/pocketbase'

const CONFIG_KEY = 'lifeorganizer_admin_config'

function readLocal(): AdminConfig {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') as AdminConfig | null
    if (parsed?.supportEmails?.length) return parsed
  } catch { /* ignore */ }
  return { supportEmails: [...DEFAULT_SUPPORT_EMAILS] }
}

function writeLocal(config: AdminConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function getAdminConfig(): AdminConfig {
  return readLocal()
}

export function getSupportEmails(): string[] {
  return readLocal().supportEmails.filter(Boolean)
}

export async function loadAdminConfig(): Promise<AdminConfig> {
  if (isCloudEnabled() && isPbAdmin()) {
    const cloud = await fetchAdminConfigFromCloud()
    if (cloud) {
      writeLocal(cloud)
      return cloud
    }
  }
  return readLocal()
}

export function saveSupportEmails(emails: string[]): string | null {
  const cleaned = emails.map(e => e.trim().toLowerCase()).filter(Boolean)
  const unique = [...new Set(cleaned)]
  if (unique.length === 0) return 'Mindestens eine Support-E-Mail ist erforderlich.'
  const invalid = unique.find(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  if (invalid) return `Ungültige E-Mail: ${invalid}`
  const config = { supportEmails: unique }
  writeLocal(config)
  void syncAdminConfigToCloud(config)
  return null
}

export function addSupportEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return 'E-Mail darf nicht leer sein.'
  const current = getSupportEmails()
  if (current.includes(trimmed)) return 'Diese E-Mail ist bereits hinterlegt.'
  return saveSupportEmails([...current, trimmed])
}

export function removeSupportEmail(email: string): string | null {
  const current = getSupportEmails().filter(e => e !== email.toLowerCase())
  return saveSupportEmails(current)
}