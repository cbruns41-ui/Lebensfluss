import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasActiveAccess, needsPlanSelection, isDemoUser } from '../lib/subscription'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (needsPlanSelection(user)) {
    return <Navigate to="/registrieren/preise" replace state={{ from: location }} />
  }

  if (!isDemoUser(user) && !hasActiveAccess(user)) {
    return <Navigate to="/registrieren/preise?expired=1" replace state={{ from: location }} />
  }

  return <>{children}</>
}