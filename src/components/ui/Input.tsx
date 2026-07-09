import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl input-field',
          'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25',
          'transition-all',
          className,
        )}
        {...props}
      />
    </label>
  )
}