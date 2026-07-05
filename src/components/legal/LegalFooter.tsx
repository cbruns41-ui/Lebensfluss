import { Link } from 'react-router-dom'

const links = [
  { to: '/support', label: 'Support' },
  { to: '/impressum', label: 'Impressum' },
  { to: '/datenschutz', label: 'Datenschutz' },
  { to: '/agb', label: 'AGB' },
  { to: '/widerruf', label: 'Widerruf' },
]

export function LegalFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`px-6 py-6 border-t border-slate-800 ${className}`}>
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-faint max-w-3xl mx-auto">
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className="hover:text-slate-300 transition-colors">
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-center text-xs text-faint mt-3">© {new Date().getFullYear()} Lebensfluss</p>
    </footer>
  )
}