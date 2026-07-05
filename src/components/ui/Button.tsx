import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25',
        variant === 'secondary' && 'glass hover:bg-slate-700/60 text-slate-200',
        variant === 'ghost' && 'hover:bg-slate-800 text-slate-300',
        variant === 'danger' && 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3.5 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}