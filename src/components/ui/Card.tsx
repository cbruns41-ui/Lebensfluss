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
        'glass rounded-2xl p-4 transition-all',
        onClick && 'cursor-pointer hover:border-emerald-500/30 active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </div>
  )
}