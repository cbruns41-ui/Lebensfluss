import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50',
          'text-slate-100 placeholder:text-slate-500',
          'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25',
          'transition-all',
          className,
        )}
        {...props}
      />
    </label>
  )
}