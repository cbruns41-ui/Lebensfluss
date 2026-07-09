import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { MoreMenu } from './MoreMenu'
import { OnboardingModal } from '../OnboardingModal'
import { FocusModeGuard } from '../FocusModeGuard'
import { InstallBanner } from '../InstallBanner'
import { QuickCapture } from '../QuickCapture'
import { ThemeSync } from '../ThemeSync'
import { HabitReminders } from '../HabitReminders'

export function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-dvh pb-28 page-bg">
      <ThemeSync />
      <HabitReminders />
      <InstallBanner />
      <FocusModeGuard>
        <Outlet />
      </FocusModeGuard>
      <QuickCapture />
      <BottomNav onMoreClick={() => setMoreOpen(true)} />
      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
      <OnboardingModal />
    </div>
  )
}