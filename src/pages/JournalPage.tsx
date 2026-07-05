import { useState } from 'react'
import { Plus, Trash2, Pin, Pencil, Search } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, toDateKey, formatDate, cn } from '../lib/utils'
import type { JournalEntry, QuickNote } from '../types'
import { getDailyJournalPrompt, getDailyGratitudePrompt, journalPrompts, gratitudePrompts } from '../lib/journalPrompts'

type Tab = 'journal' | 'gratitude' | 'notes'

export function JournalPage() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [tab, setTab] = useState<Tab>('journal')
  const [editModal, setEditModal] = useState(false)
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')

  const dailyPrompt = tab === 'gratitude' ? getDailyGratitudePrompt() : getDailyJournalPrompt()
  const promptList = tab === 'gratitude' ? gratitudePrompts : journalPrompts

  const openJournalCreate = () => {
    setEditingJournalId(null)
    setContent(tab === 'gratitude' ? `${dailyPrompt}\n\n` : `${dailyPrompt}\n\n`)
    setEditModal(true)
  }

  const openJournalEdit = (entry: JournalEntry) => {
    setEditingJournalId(entry.id); setContent(entry.content); setEditModal(true)
  }

  const openNoteEdit = (note: QuickNote) => {
    setEditingNoteId(note.id); setContent(note.content); setEditModal(true)
  }

  const saveJournal = () => {
    if (!content.trim()) return
    if (editingJournalId) {
      updateData(prev => ({ ...prev, journalEntries: prev.journalEntries.map(e => e.id === editingJournalId ? { ...e, content: content.trim() } : e) }))
    } else {
      updateData(prev => ({
        ...prev,
        journalEntries: [{ id: generateId(), date: toDateKey(new Date()), content: content.trim(), type: tab === 'gratitude' ? 'gratitude' : 'journal' }, ...prev.journalEntries],
      }))
    }
    setEditModal(false); setContent('')
  }

  const saveNote = () => {
    if (!content.trim()) return
    if (editingNoteId) {
      updateData(prev => ({ ...prev, quickNotes: prev.quickNotes.map(n => n.id === editingNoteId ? { ...n, content: content.trim() } : n) }))
    }
    setEditModal(false); setContent('')
  }

  const deleteEntry = (id: string) => {
    confirm({ title: 'Eintrag löschen?', message: 'Der Eintrag wird unwiderruflich entfernt.', onConfirm: () =>
      updateData(prev => ({ ...prev, journalEntries: prev.journalEntries.filter(e => e.id !== id) })) })
  }

  const deleteNote = (id: string) => {
    confirm({ title: 'Notiz löschen?', message: 'Die Notiz wird entfernt.', onConfirm: () =>
      updateData(prev => ({ ...prev, quickNotes: prev.quickNotes.filter(n => n.id !== id) })) })
  }

  const togglePin = (id: string) => {
    updateData(prev => ({ ...prev, quickNotes: prev.quickNotes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n) }))
  }

  const entries = data.journalEntries
    .filter(e => e.type === (tab === 'gratitude' ? 'gratitude' : 'journal'))
    .filter(e => !search.trim() || e.content.toLowerCase().includes(search.toLowerCase()))
  const sortedNotes = [...data.quickNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Tagebuch" subtitle="Gedanken, Dankbarkeit & Notizen" helpId="tagebuch"
        actions={tab !== 'notes' ? <Button size="sm" onClick={openJournalCreate}><Plus size={16} /> Neu</Button> : undefined} />

      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        {(['journal', 'gratitude', 'notes'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-2.5 rounded-lg text-xs font-medium', tab === t ? 'bg-emerald-500 text-white' : 'text-muted')}>
            {t === 'journal' ? 'Tagebuch' : t === 'gratitude' ? 'Dankbarkeit' : 'Notizen'}
          </button>
        ))}
      </div>

      {tab !== 'notes' && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Einträge durchsuchen…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      )}

      {tab !== 'notes' ? (
        <div className="space-y-3">
          {entries.length === 0 ? <Card className="text-center py-8 text-muted text-sm">Noch keine Einträge</Card> : entries.map(entry => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-faint mb-2">{formatDate(entry.date)}</p>
                  <p className="text-sm leading-relaxed">{entry.content}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openJournalEdit(entry)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                  <button onClick={() => deleteEntry(entry.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedNotes.map(note => (
            <Card key={note.id} className={cn('flex items-start gap-3', note.pinned && 'border-amber-500/30')}>
              <button onClick={() => togglePin(note.id)} className={note.pinned ? 'text-amber-400' : 'text-faint'}><Pin size={14} /></button>
              <p className="flex-1 text-sm">{note.content}</p>
              <button onClick={() => openNoteEdit(note)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
              <button onClick={() => deleteNote(note.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editModal} onClose={() => setEditModal(false)} title={editingJournalId || editingNoteId ? 'Bearbeiten' : 'Neuer Eintrag'}>
        {!editingNoteId && !editingJournalId && (
          <div className="flex flex-wrap gap-2 mb-3">
            {promptList.slice(0, 4).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setContent(prev => prev.trim() ? `${prev}\n\n${p}\n` : `${p}\n\n`)}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              >
                {p.length > 28 ? p.slice(0, 28) + '…' : p}
              </button>
            ))}
          </div>
        )}
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none focus:border-emerald-500/50" />
        <Button onClick={editingNoteId ? saveNote : saveJournal} className="w-full mt-4">Speichern</Button>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''} onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}