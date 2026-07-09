import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl p-4 transition-all duration-200',
        onClick && 'cursor-pointer hover:border-emerald-500/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0',
        className,
      )}
    >
      {children}
    </div>
  )
}