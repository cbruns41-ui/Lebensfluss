import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, LogOut, Megaphone, Mail, Inbox, Plus, Pencil, Trash2, Pin, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { loadAdminNews, saveNewsItem, deleteNewsItem, subscribeNewsUpdates } from '../lib/news'
import { loadAdminConfig, addSupportEmail, removeSupportEmail } from '../lib/adminConfig'
import {
  loadAdminTickets, updateTicketStatus, deleteSupportTicket, subscribeSupportUpdates,
} from '../lib/support'
import { isCloudEnabled, isPbAdmin } from '../lib/api/pocketbase'
import { cn } from '../lib/utils'
import type { NewsItem, SupportTicket } from '../types'

type Tab = 'news' | 'emails' | 'tickets'

const emptyNewsForm = { title: '', content: '', pinned: false }

export function AdminPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { confirm, cancel, opts } = useConfirm()
  const [tab, setTab] = useState<Tab>('news')
  const [news, setNews] = useState<NewsItem[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [newsForm, setNewsForm] = useState(emptyNewsForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsMsg, setNewsMsg] = useState('')

  const refresh = async () => {
    const [newsItems, ticketItems, config] = await Promise.all([
      loadAdminNews(),
      loadAdminTickets(),
      loadAdminConfig(),
    ])
    setNews(newsItems)
    setTickets(ticketItems)
    setEmails(config.supportEmails)
  }

  useEffect(() => {
    void refresh()
    const unsubNews = subscribeNewsUpdates(() => { void refresh() })
    const unsubTickets = subscribeSupportUpdates(() => { void refresh() })
    return () => { unsubNews(); unsubTickets() }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const openCreateNews = () => {
    setEditingId(null)
    setNewsForm(emptyNewsForm)
    setShowNewsForm(true)
    setNewsMsg('')
  }

  const openEditNews = (item: NewsItem) => {
    setEditingId(item.id)
    setNewsForm({ title: item.title, content: item.content, pinned: item.pinned ?? false })
    setShowNewsForm(true)
    setNewsMsg('')
  }

  const handleSaveNews = async () => {
    if (!newsForm.title.trim()) { setNewsMsg('Titel erforderlich.'); return }
    if (!newsForm.content.trim()) { setNewsMsg('Inhalt erforderlich.'); return }
    try {
      await saveNewsItem({ ...newsForm, id: editingId ?? undefined })
      setShowNewsForm(false)
      setNewsForm(emptyNewsForm)
      setEditingId(null)
      await refresh()
    } catch (e) {
      setNewsMsg(e instanceof Error ? e.message : 'Speichern fehlgeschlagen')
    }
  }

  const handleDeleteNews = (id: string) => {
    confirm({
      title: 'News löschen?',
      message: 'Der Eintrag wird aus dem Newsfeed entfernt.',
      confirmLabel: 'Löschen',
      onConfirm: () => { void deleteNewsItem(id).then(refresh) },
    })
  }

  const handleAddEmail = () => {
    const err = addSupportEmail(newEmail)
    if (err) setEmailMsg(err)
    else { setNewEmail(''); setEmailMsg('E-Mail hinzugefügt.'); void refresh() }
  }

  const handleRemoveEmail = (email: string) => {
    const err = removeSupportEmail(email)
    if (err) setEmailMsg(err)
    else { setEmailMsg('E-Mail entfernt.'); void refresh() }
  }

  const tabs: { id: Tab; label: string; icon: typeof Megaphone; badge?: number }[] = [
    { id: 'news', label: 'News', icon: Megaphone },
    { id: 'emails', label: 'Support-E-Mails', icon: Mail },
    { id: 'tickets', label: 'Anfragen', icon: Inbox, badge: tickets.filter(t => t.status === 'open').length },
  ]

  return (
    <div className="min-h-dvh safe-top pb-8">
      <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm">
          <ArrowLeft size={16} /> Zur Website
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut size={16} /> Abmelden
        </Button>
      </header>

      <div className="px-5 pt-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Admin-Bereich</h1>
        <p className="text-sm text-muted mb-2">News verwalten, Support-E-Mails & Kundenanfragen</p>
        {!isCloudEnabled() ? (
          <p className="text-xs text-amber-400/90 bg-amber-500/10 rounded-xl px-3 py-2 mb-4">
            Lokaler Modus: News & Support nur in diesem Browser. Setze VITE_POCKETBASE_URL für Server (News, Support, Abo-Lizenzen – keine App-Inhalte).
          </p>
        ) : !isPbAdmin() ? (
          <p className="text-xs text-amber-400/90 bg-amber-500/10 rounded-xl px-3 py-2 mb-4">
            Server verbunden, aber PocketBase-Admin-Auth fehlt. Lege in PocketBase einen User mit role=admin an (gleiche E-Mail wie App-Admin) und melde dich neu an.
          </p>
        ) : (
          <p className="text-xs text-emerald-400/90 bg-emerald-500/10 rounded-xl px-3 py-2 mb-4">
            Server aktiv – News, Support & Abo-Lizenzen. Nutzer-App-Daten bleiben lokal auf den Geräten.
          </p>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors',
                tab === id ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'glass text-muted',
              )}
            >
              <Icon size={16} />
              {label}
              {badge ? <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'news' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Newsfeed</h2>
              <Button size="sm" onClick={openCreateNews}><Plus size={16} /> Neue Ankündigung</Button>
            </div>

            {showNewsForm && (
              <div className="glass rounded-2xl p-5 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{editingId ? 'Bearbeiten' : 'Neue Ankündigung'}</h3>
                  <button onClick={() => setShowNewsForm(false)} className="text-muted hover:text-slate-200"><X size={18} /></button>
                </div>
                <Input label="Titel" value={newsForm.title} onChange={e => setNewsForm(f => ({ ...f, title: e.target.value }))} />
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Inhalt</label>
                  <textarea
                    value={newsForm.content}
                    onChange={e => setNewsForm(f => ({ ...f, content: e.target.value }))}
                    rows={4}
                    className="w-full glass rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.pinned}
                    onChange={e => setNewsForm(f => ({ ...f, pinned: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  Oben anpinnen
                </label>
                {newsMsg && <p className="text-xs text-red-400">{newsMsg}</p>}
                <Button className="w-full" size="sm" onClick={handleSaveNews}>
                  {editingId ? 'Speichern' : 'Veröffentlichen'}
                </Button>
              </div>
            )}

            {news.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">Noch keine News – erstelle die erste Ankündigung.</p>
            ) : (
              <div className="space-y-3">
                {news.map(item => (
                  <div key={item.id} className="glass rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {item.title}
                          {item.pinned && <Pin size={14} className="text-amber-400" />}
                        </h3>
                        <p className="text-xs text-faint mt-0.5">
                          {new Date(item.publishedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEditNews(item)} className="p-2 text-muted hover:text-emerald-400 rounded-lg hover:bg-slate-800">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-muted hover:text-red-400 rounded-lg hover:bg-slate-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted whitespace-pre-wrap line-clamp-3">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'emails' && (
          <div>
            <h2 className="font-semibold mb-2">Support-E-Mail-Adressen</h2>
            <p className="text-sm text-muted mb-4">
              Kundenanfragen werden an diese Adressen weitergeleitet (per PocketBase/E-Mail-Server).
            </p>
            <div className="glass rounded-2xl p-4 mb-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  label="Neue E-Mail"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="support@beispiel.de"
                  className="flex-1"
                />
                <Button size="sm" className="self-end" onClick={handleAddEmail}><Plus size={16} /> Hinzufügen</Button>
              </div>
              {emailMsg && <p className={cn('text-xs', emailMsg.includes('hinzugefügt') || emailMsg.includes('entfernt') ? 'text-emerald-400' : 'text-red-400')}>{emailMsg}</p>}
            </div>
            <div className="space-y-2">
              {emails.map(email => (
                <div key={email} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    disabled={emails.length <= 1}
                    className="text-muted hover:text-red-400 disabled:opacity-30"
                    title={emails.length <= 1 ? 'Mindestens eine E-Mail erforderlich' : 'Entfernen'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'tickets' && (
          <div>
            <h2 className="font-semibold mb-4">Kundenanfragen</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">Noch keine Support-Anfragen.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="glass rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <p className="text-xs text-muted">{ticket.userName} · {ticket.userEmail}</p>
                        <p className="text-xs text-faint">
                          {new Date(ticket.createdAt).toLocaleString('de-DE')}
                        </p>
                      </div>
                      <span className={cn(
                        'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0',
                        ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-muted',
                      )}>
                        {ticket.status === 'open' ? 'Offen' : 'Erledigt'}
                      </span>
                    </div>
                    <p className="text-sm text-muted whitespace-pre-wrap mb-3">{ticket.message}</p>
                    <div className="flex gap-2">
                      {ticket.status === 'open' ? (
                        <Button size="sm" variant="secondary" onClick={() => { void updateTicketStatus(ticket.id, 'closed').then(refresh) }}>
                          Als erledigt markieren
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => { void updateTicketStatus(ticket.id, 'open').then(refresh) }}>
                          Wieder öffnen
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => {
                        confirm({
                          title: 'Anfrage löschen?',
                          message: 'Diese Support-Anfrage wird unwiderruflich entfernt.',
                          confirmLabel: 'Löschen',
                          onConfirm: () => { void deleteSupportTicket(ticket.id).then(refresh) },
                        })
                      }}>
                        <Trash2 size={14} />
                      </Button>
                      <a href={`mailto:${ticket.userEmail}?subject=Re: ${encodeURIComponent(ticket.subject)}`}>
                        <Button size="sm" variant="ghost"><Mail size={14} /> Antworten</Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''} confirmLabel={opts?.confirmLabel}
        onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}