import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Pencil, Sparkles, Sun, Share2, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, formatDate } from '../lib/utils'
import type { WeeklyReview } from '../types'
import {
  buildWeeklyStatsSummary, weeklyReviewPrompts,
  shareWeeklyReviewExport, downloadWeeklyReviewExport, buildWeeklyReviewExport,
} from '../lib/weeklyReviewGuide'

import { getWeekStart } from '../lib/sundayRitual'

export function WeeklyReviewPage() {
  const { user } = useAuth()
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [wins, setWins] = useState('')
  const [improvements, setImprovements] = useState('')
  const [nextWeek, setNextWeek] = useState('')

  const statsSummary = buildWeeklyStatsSummary(data)
  const currentWeekReview = data.weeklyReviews.find(r => r.weekStart === getWeekStart()) ?? data.weeklyReviews[0] ?? null

  const handleShareExport = async () => {
    const result = await shareWeeklyReviewExport(data, currentWeekReview, user?.name)
    setShareStatus(result === 'shared' ? 'Geteilt!' : result === 'copied' ? 'Kopiert!' : 'Fehlgeschlagen')
    setTimeout(() => setShareStatus(null), 2500)
  }

  const openCreate = () => {
    setEditingId(null); setWins(''); setImprovements(''); setNextWeek(''); setModalOpen(true)
  }

  const applyPrompt = (field: 'wins' | 'improvements' | 'nextWeek', prompt: string) => {
    const setters = { wins: setWins, improvements: setImprovements, nextWeek: setNextWeek }
    const getters = { wins, improvements, nextWeek }
    const cur = getters[field]
    setters[field](cur.trim() ? `${cur}\n${prompt} ` : `${prompt} `)
  }

  const openEdit = (r: WeeklyReview) => {
    setEditingId(r.id); setWins(r.wins); setImprovements(r.improvements); setNextWeek(r.nextWeek); setModalOpen(true)
  }

  const save = () => {
    if (!wins.trim() && !improvements.trim() && !nextWeek.trim()) return
    const review: WeeklyReview = {
      id: editingId ?? generateId(),
      weekStart: editingId ? data.weeklyReviews.find(r => r.id === editingId)!.weekStart : getWeekStart(),
      wins: wins.trim(), improvements: improvements.trim(), nextWeek: nextWeek.trim(),
    }
    updateData(prev => ({
      ...prev,
      weeklyReviews: editingId
        ? prev.weeklyReviews.map(r => r.id === editingId ? review : r)
        : [review, ...prev.weeklyReviews],
    }))
    setModalOpen(false)
  }

  const deleteReview = (id: string) => {
    confirm({ title: 'Review löschen?', message: 'Das Wochenreview wird entfernt.', onConfirm: () =>
      updateData(prev => ({ ...prev, weeklyReviews: prev.weeklyReviews.filter(r => r.id !== id) })) })
  }

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto">
      <PageHeader title="Wochenreview" subtitle="Reflektiere & plane" helpId="wochenreview"
        actions={<Button size="sm" onClick={openCreate}><Plus size={16} /> Review</Button>} />

      <Card className="mb-4 border-emerald-500/15">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span className="text-sm font-medium">Deine Woche in Zahlen</span>
        </div>
        <pre className="text-xs text-muted whitespace-pre-wrap font-sans leading-relaxed">{statsSummary}</pre>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="secondary" className="flex-1" onClick={handleShareExport}>
            <Share2 size={14} /> Export teilen
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => downloadWeeklyReviewExport(data, currentWeekReview, user?.name)}
          >
            <Download size={14} /> .txt
          </Button>
        </div>
        {shareStatus && <p className="text-xs text-emerald-400 mt-2">{shareStatus}</p>}
        <button
          type="button"
          onClick={() => setShowExportPreview(v => !v)}
          className="text-xs text-emerald-400 mt-2 hover:text-emerald-300"
        >
          {showExportPreview ? 'Vollständigen Export ausblenden' : 'Vollständigen Export anzeigen (inkl. Life Score)'}
        </button>
        {showExportPreview && (
          <pre className="mt-2 text-[10px] text-muted whitespace-pre-wrap font-sans leading-relaxed p-3 rounded-xl bg-slate-800/50 max-h-48 overflow-y-auto">
            {buildWeeklyReviewExport(data, currentWeekReview, user?.name)}
          </pre>
        )}
      </Card>

      <Link to="/app/wochenritual">
        <Card className="mb-4 border-amber-500/20 hover:border-amber-500/35">
          <div className="flex items-center gap-3">
            <Sun size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sonntags-Ritual</p>
              <p className="text-xs text-muted">Geführter Wochenstart mit Fokus & Report</p>
            </div>
          </div>
        </Card>
      </Link>

      <div className="space-y-3">
        {data.weeklyReviews.length === 0 ? (
          <Card className="text-center py-12 text-muted text-sm">Noch kein Wochenreview – starte jetzt!</Card>
        ) : data.weeklyReviews.map(review => (
          <Card key={review.id}>
            <div className="flex justify-between mb-2">
              <p className="text-xs text-faint">Woche ab {formatDate(review.weekStart)}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(review)} className="text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                <button onClick={() => deleteReview(review.id)} className="text-faint hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            {review.wins && <p className="text-sm mb-2"><span className="text-emerald-400">✓</span> {review.wins}</p>}
            {review.improvements && <p className="text-sm mb-2"><span className="text-amber-400">→</span> {review.improvements}</p>}
            {review.nextWeek && <p className="text-sm"><span className="text-blue-400">◎</span> {review.nextWeek}</p>}
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Review bearbeiten' : 'Neues Wochenreview'}>
        <div className="space-y-4">
          {(['wins', 'improvements', 'nextWeek'] as const).map(field => {
            const labels = { wins: '🏆 Was lief gut?', improvements: '💡 Was kann besser werden?', nextWeek: '🎯 Fokus nächste Woche' }
            const colors = { wins: 'text-emerald-400', improvements: 'text-amber-400', nextWeek: 'text-blue-400' }
            const values = { wins, improvements, nextWeek }
            const setters = { wins: setWins, improvements: setImprovements, nextWeek: setNextWeek }
            return (
              <div key={field}>
                <label className={`text-sm ${colors[field]} font-medium mb-1.5 block`}>{labels[field]}</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {weeklyReviewPrompts[field].map(p => (
                    <button key={p} type="button" onClick={() => applyPrompt(field, p)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-muted hover:text-emerald-400">
                      {p.length > 32 ? p.slice(0, 32) + '…' : p}
                    </button>
                  ))}
                </div>
                <textarea value={values[field]} onChange={e => setters[field](e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm resize-none focus:outline-none" />
              </div>
            )
          })}
          <Button onClick={save} className="w-full">{editingId ? 'Speichern' : 'Review speichern'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''} onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}