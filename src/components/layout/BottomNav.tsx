import { NavLink } from 'react-router-dom'
import { Home, Target, UtensilsCrossed, MoreHorizontal, ShoppingCart } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { cn } from '../../lib/utils'

const mainTabs = [
  { to: '/app', icon: Home, label: 'Start', end: true },
  { to: '/app/gewohnheiten', icon: Target, label: 'Gewohnh.' },
  { to: '/app/einkauf', icon: ShoppingCart, label: 'Einkauf', badge: true },
  { to: '/app/essen', icon: UtensilsCrossed, label: 'Essen' },
]

interface BottomNavProps {
  onMoreClick: () => void
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const { data } = useData()
  const unchecked = data.groceryList.filter(g => !g.checked).length

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-3 mb-3 glass rounded-2xl shadow-2xl shadow-black/40">
        <div className="flex items-center justify-around px-1 py-2">
          {mainTabs.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[56px] relative',
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {badge && unchecked > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-purple-500 text-[9px] font-bold text-white flex items-center justify-center">
                        {unchecked > 99 ? '99+' : unchecked}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all min-w-[56px]"
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">Mehr</span>
          </button>
        </div>
      </div>
    </nav>
  )
}