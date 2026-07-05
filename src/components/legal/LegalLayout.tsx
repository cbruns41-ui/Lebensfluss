import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LegalFooter } from './LegalFooter'

interface LegalLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col safe-top">
      <div className="px-6 py-5 max-w-3xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <ArrowLeft size={16} /> Zur Startseite
        </Link>
      </div>

      <article className="flex-1 px-6 pb-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose-legal space-y-6 text-slate-300 text-sm leading-relaxed">
          {children}
        </div>
      </article>

      <LegalFooter />
    </div>
  )
}