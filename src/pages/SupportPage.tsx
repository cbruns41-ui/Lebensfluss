import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LegalFooter } from '../components/legal/LegalFooter'
import { submitSupportTicket } from '../lib/support'
import { cn } from '../lib/utils'

export function SupportPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSending(true)
    const err = await submitSupportTicket({
      userId: user?.id,
      userName: name,
      userEmail: email,
      subject,
      message,
    })
    setSending(false)
    if (err) setError(err)
    else {
      setSuccess(true)
      setSubject('')
      setMessage('')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col safe-top">
      <div className="px-6 py-5 max-w-lg mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm">
          <ArrowLeft size={16} /> Zur Startseite
        </Link>
      </div>

      <div className="flex-1 px-6 pb-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <LifeBuoy size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Support kontaktieren</h1>
          <p className="text-slate-400 text-sm">
            Beschreibe dein Anliegen – wir melden uns per E-Mail bei dir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Betreff" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Worum geht es?" required />
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nachricht</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              required
              placeholder="Beschreibe dein Problem oder deine Frage…"
              className="w-full glass rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2.5">{error}</p>}
          {success && (
            <p className="text-emerald-400 text-sm bg-emerald-500/10 rounded-xl px-4 py-2.5">
              Anfrage gesendet! Wir melden uns so schnell wie möglich.
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={sending}>
            <Send size={16} /> {sending ? 'Wird gesendet…' : 'Anfrage absenden'}
          </Button>
        </form>

        <p className={cn('text-center text-xs text-faint mt-4')}>
          Antwortzeit in der Regel innerhalb von 48 Stunden (Werktage).
        </p>
      </div>

      <LegalFooter />
    </div>
  )
}