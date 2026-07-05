import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../lib/admin'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isAdmin(user)) return <Navigate to="/login" replace />
  return <>{children}</>
}