import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import {
  getUsers, saveUsers, getSession, setSession, clearSession, getUserData, saveUserData,
  defaultAppData, deleteUserAccount,
} from '../lib/storage'
import { DEMO_EMAIL, DEMO_USER_ID, createDemoAppData } from '../lib/demoData'
import {
  defaultSubscription, startTrial, activatePlan, cancelSubscription as cancelSub,
  migrateUser, isDemoUser,
} from '../lib/subscription'
import { pbAuthWithPassword, pbLogout } from '../lib/api/pocketbase'
import { deleteLicenseOnServer, refreshLicenseFromServer } from '../lib/license'
import { createCheckoutSession, createPortalSession, isStripeCheckoutAvailable, isPaymentSimulationAllowed } from '../lib/stripe'
import { ADMIN_USER_ID, ADMIN_EMAIL } from '../config/admin'
import { ensureAdminUser, isAdmin, isAdminEmail } from '../lib/admin'
import type { PaidPlanId } from '../config/pricing'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => string | null
  register: (name: string, email: string, password: string) => string | null
  loginAsDemo: () => void
  updateProfile: (name: string, email: string, password?: string) => string | null
  selectPlan: (plan: PaidPlanId | 'trial') => Promise<string | null>
  completeCheckout: () => Promise<string | null>
  cancelSubscription: () => Promise<string | null>
  deleteAccount: () => Promise<string | null>
  refreshUser: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function persistUser(updated: User) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === updated.id)
  if (idx >= 0) {
    users[idx] = updated
    saveUsers(users)
  }
}

function loadAndMigrateUsers(): User[] {
  const before = getUsers()
  const users = ensureAdminUser(before.map(migrateUser))
  const adminCreated = !before.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
    && users.some(u => u.id === ADMIN_USER_ID)
  if (adminCreated) saveUserData(ADMIN_USER_ID, defaultAppData())
  saveUsers(users)
  return users
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = getSession()
    if (sessionId) {
      const users = loadAndMigrateUsers()
      const found = users.find(u => u.id === sessionId)
      if (found) {
        setUser(found)
        void refreshLicenseFromServer(found).then(remote => {
          if (!remote) return
          persistUser(remote)
          setUser(remote)
        })
      } else clearSession()
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): string | null => {
    const users = loadAndMigrateUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return 'E-Mail oder Passwort ist falsch.'
    setUser(found)
    setSession(found.id)
    if (isAdmin(found)) void pbAuthWithPassword(email, password)
    void refreshLicenseFromServer(found).then(remote => {
      if (!remote) return
      persistUser(remote)
      setUser(remote)
    })
    return null
  }

  const register = (name: string, email: string, password: string): string | null => {
    if (!name.trim()) return 'Bitte gib deinen Namen ein.'
    if (!email.trim()) return 'Bitte gib deine E-Mail ein.'
    if (password.length < 6) return 'Das Passwort muss mindestens 6 Zeichen haben.'
    if (isAdminEmail(email)) return 'Diese E-Mail ist für den Admin-Zugang reserviert.'

    const users = loadAndMigrateUsers()
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return 'Diese E-Mail ist bereits registriert.'
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
      subscription: defaultSubscription(),
    }

    users.push(newUser)
    saveUsers(users)
    saveUserData(newUser.id, defaultAppData())
    setUser(newUser)
    setSession(newUser.id)
    return null
  }

  const loginAsDemo = () => {
    const users = loadAndMigrateUsers()
    let demo = users.find(u => u.id === DEMO_USER_ID || u.email === DEMO_EMAIL)

    if (!demo) {
      demo = {
        id: DEMO_USER_ID,
        name: 'Demo Nutzer',
        email: DEMO_EMAIL,
        password: 'demo',
        createdAt: new Date().toISOString(),
        subscription: { plan: 'demo' },
      }
      users.push(demo)
      saveUsers(users)
      saveUserData(demo.id, createDemoAppData())
    } else {
      demo = { ...demo, subscription: { plan: 'demo' } }
      persistUser(demo)
      if (getUserData(demo.id).habits.length === 0) {
        saveUserData(demo.id, createDemoAppData())
      }
    }

    setUser(demo)
    setSession(demo.id)
  }

  const updateProfile = (name: string, email: string, password?: string): string | null => {
    if (!user) return 'Nicht angemeldet.'
    if (!name.trim()) return 'Name darf nicht leer sein.'
    if (!email.trim()) return 'E-Mail darf nicht leer sein.'
    if (password && password.length < 6) return 'Passwort muss mindestens 6 Zeichen haben.'

    const users = getUsers()
    if (users.some(u => u.id !== user.id && u.email.toLowerCase() === email.trim().toLowerCase())) {
      return 'Diese E-Mail ist bereits vergeben.'
    }

    const idx = users.findIndex(u => u.id === user.id)
    if (idx < 0) return 'Benutzer nicht gefunden.'

    const updated: User = {
      ...users[idx],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(password ? { password } : {}),
    }
    users[idx] = updated
    saveUsers(users)
    setUser(updated)
    return null
  }

  const selectPlan = async (plan: PaidPlanId | 'trial'): Promise<string | null> => {
    if (!user) return 'Nicht angemeldet.'
    if (isDemoUser(user)) return null

    const now = new Date().toISOString()

    if (plan === 'trial') {
      const updated: User = {
        ...user,
        subscription: startTrial(),
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
      }
      persistUser(updated)
      setUser(updated)
      return null
    }

    if (isStripeCheckoutAvailable()) {
      const url = await createCheckoutSession({
        plan,
        email: user.email,
        localUserId: user.id,
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
      })
      if (url) {
        window.location.href = url
        return null
      }
      return 'Zahlungsserver nicht erreichbar. Bitte später erneut versuchen.'
    }

    if (isPaymentSimulationAllowed()) {
      const updated: User = {
        ...user,
        subscription: activatePlan(plan),
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
      }
      persistUser(updated)
      setUser(updated)
      await new Promise(r => setTimeout(r, 800))
      return null
    }

    return 'Online-Zahlung ist noch nicht aktiv. Bitte kontaktiere den Support.'
  }

  const completeCheckout = async (): Promise<string | null> => {
    if (!user) return 'Nicht angemeldet.'
    const remote = await refreshLicenseFromServer(user)
    if (remote) {
      persistUser(remote)
      setUser(remote)
      return null
    }
    return 'Zahlung wird noch verarbeitet. Bitte Seite in ein paar Sekunden neu laden.'
  }

  const cancelSubscription = async (): Promise<string | null> => {
    if (!user) return 'Nicht angemeldet.'
    const sub = user.subscription
    if (sub.plan !== 'monthly' && sub.plan !== 'yearly') {
      return 'Dieses Abo kann nicht gekündigt werden.'
    }
    if (sub.cancelAtPeriodEnd) return 'Das Abo ist bereits zur Kündigung vorgemerkt.'

    if (isStripeCheckoutAvailable()) {
      const url = await createPortalSession(user.email, user.id)
      if (url) {
        window.location.href = url
        return null
      }
      return 'Stripe-Portal nicht erreichbar. Bitte Support kontaktieren.'
    }

    if (isPaymentSimulationAllowed()) {
      const updated: User = { ...user, subscription: cancelSub(sub) }
      persistUser(updated)
      setUser(updated)
      return null
    }

    return 'Kündigung online nicht verfügbar. Bitte Support kontaktieren.'
  }

  const deleteAccount = async (): Promise<string | null> => {
    if (!user) return 'Nicht angemeldet.'
    if (isDemoUser(user)) return 'Das Demo-Konto kann nicht gelöscht werden.'

    const userId = user.id
    await deleteLicenseOnServer(user.email, user.id)
    deleteUserAccount(userId)
    setUser(null)
    return null
  }

  const refreshUser = () => {
    if (!user) return
    const found = loadAndMigrateUsers().find(u => u.id === user.id)
    if (found) setUser(found)
  }

  const logout = () => {
    pbLogout()
    setUser(null)
    clearSession()
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, loginAsDemo, updateProfile,
      selectPlan, completeCheckout, cancelSubscription, deleteAccount, refreshUser, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { getUserData, saveUserData }