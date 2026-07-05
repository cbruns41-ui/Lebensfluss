import type { SupportTicket } from '../types'
import { getSupportEmails } from './adminConfig'
import {
  sendSupportTicketToCloud, fetchSupportTicketsFromCloud,
  updateTicketStatusInCloud, deleteTicketFromCloud,
  isCloudEnabled, isPbAdmin,
} from './api/pocketbase'

const TICKETS_KEY = 'lifeorganizer_support_tickets'
const TICKETS_EVENT = 'lifeorganizer-support-updated'

function readLocal(): SupportTicket[] {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(tickets: SupportTicket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  window.dispatchEvent(new Event(TICKETS_EVENT))
}

function sortTickets(tickets: SupportTicket[]): SupportTicket[] {
  return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getSupportTickets(): SupportTicket[] {
  return sortTickets(readLocal())
}

export async function loadAdminTickets(): Promise<SupportTicket[]> {
  if (isCloudEnabled() && isPbAdmin()) {
    const cloud = await fetchSupportTicketsFromCloud()
    if (cloud.length > 0) {
      writeLocal(cloud)
      return sortTickets(cloud)
    }
  }
  return getSupportTickets()
}

export function getOpenTicketCount(): number {
  return readLocal().filter(t => t.status === 'open').length
}

export async function submitSupportTicket(input: {
  userId?: string
  userName: string
  userEmail: string
  subject: string
  message: string
}): Promise<string | null> {
  if (!input.userName.trim()) return 'Bitte gib deinen Namen an.'
  if (!input.userEmail.trim()) return 'Bitte gib deine E-Mail an.'
  if (!input.subject.trim()) return 'Bitte gib einen Betreff an.'
  if (!input.message.trim()) return 'Bitte beschreibe dein Anliegen.'

  const ticket: SupportTicket = {
    id: crypto.randomUUID(),
    userId: input.userId,
    userName: input.userName.trim(),
    userEmail: input.userEmail.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
    status: 'open',
  }

  if (isCloudEnabled()) {
    const sent = await sendSupportTicketToCloud(ticket, [])
    if (sent) return null
    return 'Support-Server nicht erreichbar. Bitte später erneut versuchen.'
  }

  const emails = getSupportEmails()
  if (emails.length === 0) {
    return 'Support ist derzeit nicht erreichbar. Bitte versuche es später erneut.'
  }

  const tickets = readLocal()
  tickets.push(ticket)
  writeLocal(tickets)
  return null
}

export async function updateTicketStatus(id: string, status: SupportTicket['status']): Promise<void> {
  if (isCloudEnabled() && isPbAdmin()) {
    await updateTicketStatusInCloud(id, status)
  }
  writeLocal(readLocal().map(t => t.id === id ? { ...t, status } : t))
}

export async function deleteSupportTicket(id: string): Promise<void> {
  if (isCloudEnabled() && isPbAdmin()) {
    await deleteTicketFromCloud(id)
  }
  writeLocal(readLocal().filter(t => t.id !== id))
}

export function subscribeSupportUpdates(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener(TICKETS_EVENT, handler)
  return () => window.removeEventListener(TICKETS_EVENT, handler)
}