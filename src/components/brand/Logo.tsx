import { cn } from '../../lib/utils'
import { brand } from '../../config/brand'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
  className?: string
}

const sizes = {
  sm: { box: 'w-8 h-8', text: 'text-sm', rx: 8 },
  md: { box: 'w-10 h-10', text: 'text-base', rx: 10 },
  lg: { box: 'w-14 h-14', text: 'text-lg', rx: 14 },
  xl: { box: 'w-16 h-16', text: 'text-xl', rx: 16 },
}

/** Lebensfluss-Icon: Flusswelle + Lebenspunkt */
export function LogoMark({ size = 'md', className }: { size?: LogoProps['size']; className?: string }) {
  const s = sizes[size]
  const uid = `lf-${size}`
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(s.box, 'shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="40%" stopColor="#064e3b" />
          <stop offset="75%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`${uid}-wave`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="52%" cy="48%" r="45%">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" rx={s.rx * 2.2} fill={`url(#${uid}-bg)`} />
      <rect width="100" height="100" rx={s.rx * 2.2} fill={`url(#${uid}-glow)`} />
      <path
        d="M10 62 C 24 48, 34 74, 48 56 S 72 42, 90 50"
        fill="none"
        stroke={`url(#${uid}-wave)`}
        strokeWidth="6.5"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 58 C 28 42, 38 72, 52 52 S 78 38, 88 48"
        fill="none"
        stroke={`url(#${uid}-wave)`}
        strokeWidth="7"
        strokeLinecap="round"
        filter={`url(#${uid}-soft)`}
      />
      <path
        d="M12 58 C 28 42, 38 72, 52 52 S 78 38, 88 48"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="52" cy="52" r="11" fill="#ecfdf5" opacity="0.2" />
      <circle cx="52" cy="52" r="9" fill="#ecfdf5" opacity="0.95" />
      <circle cx="52" cy="52" r="4.5" fill="#10b981" />
      <circle cx="50" cy="50" r="1.8" fill="white" opacity="0.85" />
    </svg>
  )
}

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={cn('font-bold tracking-tight', s.text)}>{brand.name}</span>
      )}
    </div>
  )
}