import { Navigate, useLocation } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { getActiveFocusMode } from '../lib/sundayRitual'
import { isAppPathVisible, FOCUS_MODE_LABELS } from '../lib/focusMode'

export function FocusModeGuard({ children }: { children: React.ReactNode }) {
  const { data } = useData()
  const location = useLocation()
  const mode = getActiveFocusMode(data)

  if (!isAppPathVisible(location.pathname, mode)) {
    return (
      <Navigate
        to="/app"
        replace
        state={{ focusRedirect: true, mode: FOCUS_MODE_LABELS[mode] }}
      />
    )
  }

  return <>{children}</>
}