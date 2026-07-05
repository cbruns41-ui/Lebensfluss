import { useEffect, useState } from 'react'
import { Megaphone, Pin } from 'lucide-react'
import { loadPublicNews, subscribeNewsUpdates } from '../lib/news'
import type { NewsItem } from '../types'

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    loadPublicNews().then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
    return subscribeNewsUpdates(refresh)
  }, [])

  if (loading) return null
  if (items.length === 0) return null

  return (
    <section id="news" className="px-6 py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone size={20} className="text-emerald-400" />
        <h2 className="text-2xl font-bold">Neuigkeiten</h2>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <article key={item.id} className="glass rounded-2xl p-5 text-left">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-slate-100">{item.title}</h3>
              {item.pinned && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-400 shrink-0">
                  <Pin size={12} /> Angepinnt
                </span>
              )}
            </div>
            <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">{item.content}</p>
            <time className="text-xs text-faint mt-3 block" dateTime={item.publishedAt}>
              {new Date(item.publishedAt).toLocaleDateString('de-DE', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </time>
          </article>
        ))}
      </div>
    </section>
  )
}