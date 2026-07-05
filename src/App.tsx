import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { HabitTracker } from './pages/HabitTracker'
import { BudgetTracker } from './pages/BudgetTracker'
import { SavingsChallenge } from './pages/SavingsChallenge'
import { MealPrep } from './pages/MealPrep'
import { MonthlyPlanner } from './pages/MonthlyPlanner'
import { GoalsPage } from './pages/GoalsPage'
import { SettingsPage } from './pages/SettingsPage'
import { WellnessPage } from './pages/WellnessPage'
import { JournalPage } from './pages/JournalPage'
import { FocusPage } from './pages/FocusPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { WeeklyReviewPage } from './pages/WeeklyReviewPage'
import { SundayRitualPage } from './pages/SundayRitualPage'
import { RetrospectivePage } from './pages/RetrospectivePage'
import { PaywallPage } from './pages/PaywallPage'
import { ImpressumPage } from './pages/ImpressumPage'
import { DatenschutzPage } from './pages/DatenschutzPage'
import { AGBPage } from './pages/AGBPage'
import { WiderrufPage } from './pages/WiderrufPage'
import { CookieConsent } from './components/CookieConsent'
import { AdminRoute } from './components/AdminRoute'
import { AdminPage } from './pages/AdminPage'
import { SupportPage } from './pages/SupportPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CookieConsent />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registrieren/preise" element={<PaywallPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/agb" element={<AGBPage />} />
            <Route path="/widerruf" element={<WiderrufPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <AppLayout />
                  </DataProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="gewohnheiten" element={<HabitTracker />} />
              <Route path="finanzen" element={<BudgetTracker />} />
              <Route path="essen" element={<MealPrep />} />
              <Route path="einkauf" element={<MealPrep />} />
              <Route path="wellness" element={<WellnessPage />} />
              <Route path="tagebuch" element={<JournalPage />} />
              <Route path="fokus" element={<FocusPage />} />
              <Route path="spar-challenge" element={<SavingsChallenge />} />
              <Route path="planer" element={<MonthlyPlanner />} />
              <Route path="ziele" element={<GoalsPage />} />
              <Route path="statistik" element={<StatisticsPage />} />
              <Route path="rueckblick" element={<RetrospectivePage />} />
              <Route path="erfolge" element={<AchievementsPage />} />
              <Route path="wochenreview" element={<WeeklyReviewPage />} />
              <Route path="wochenritual" element={<SundayRitualPage />} />
              <Route path="einstellungen" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}