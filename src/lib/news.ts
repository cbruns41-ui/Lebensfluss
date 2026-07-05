import type { NewsItem } from '../types'
import {
  fetchPublicNewsFromCloud, syncNewsItemToCloud, deleteNewsFromCloud,
  isCloudEnabled, isPbAdmin,
} from './api/pocketbase'

const NEWS_KEY = 'lifeorganizer_news'
const NEWS_EVENT = 'lifeorganizer-news-updated'

function readLocal(): NewsItem[] {
  try {
    return JSON.parse(localStorage.getItem(NEWS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(items: NewsItem[]) {
  localStorage.setItem(NEWS_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(NEWS_EVENT))
}

function sortNews(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export function getNewsItems(): NewsItem[] {
  return sortNews(readLocal())
}

export async function loadPublicNews(): Promise<NewsItem[]> {
  if (isCloudEnabled()) {
    const cloud = await fetchPublicNewsFromCloud()
    if (cloud.length > 0) {
      writeLocal(cloud)
      return sortNews(cloud)
    }
  }
  return getNewsItems()
}

export async function loadAdminNews(): Promise<NewsItem[]> {
  if (isCloudEnabled() && isPbAdmin()) {
    const cloud = await fetchPublicNewsFromCloud()
    writeLocal(cloud)
    return sortNews(cloud)
  }
  return getNewsItems()
}

export async function saveNewsItem(
  input: Omit<NewsItem, 'id' | 'publishedAt' | 'updatedAt'> & { id?: string },
): Promise<NewsItem> {
  if (isCloudEnabled() && isPbAdmin()) {
    const synced = await syncNewsItemToCloud(input)
    if (synced) {
      const items = readLocal().filter(n => n.id !== input.id && n.id !== synced.id)
      items.push(synced)
      writeLocal(items)
      return synced
    }
  }

  const now = new Date().toISOString()
  const items = readLocal()
  let item: NewsItem

  if (input.id) {
    const idx = items.findIndex(n => n.id === input.id)
    if (idx < 0) throw new Error('News-Eintrag nicht gefunden.')
    item = {
      ...items[idx],
      title: input.title.trim(),
      content: input.content.trim(),
      pinned: input.pinned ?? false,
      updatedAt: now,
    }
    items[idx] = item
  } else {
    item = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      content: input.content.trim(),
      pinned: input.pinned ?? false,
      publishedAt: now,
      updatedAt: now,
    }
    items.push(item)
  }

  writeLocal(items)
  void syncNewsItemToCloud(item)
  return item
}

export async function deleteNewsItem(id: string): Promise<void> {
  if (isCloudEnabled() && isPbAdmin()) {
    await deleteNewsFromCloud(id)
  }
  writeLocal(readLocal().filter(n => n.id !== id))
}

export function subscribeNewsUpdates(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener(NEWS_EVENT, handler)
  return () => window.removeEventListener(NEWS_EVENT, handler)
}