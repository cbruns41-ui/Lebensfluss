import { PageHelp } from './PageHelp'

interface PageHeaderProps {
  title: string
  subtitle?: string
  helpId: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, helpId, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <PageHelp pageId={helpId} />
      </div>
    </header>
  )
}