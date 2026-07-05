import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppData } from '../types'
import { useAuth, getUserData, saveUserData } from './AuthContext'
import { applyRecurringTransactions } from '../lib/recurring'

interface DataContextType {
  data: AppData
  updateData: (updater: (prev: AppData) => AppData) => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<AppData>(() => {
    const raw = user ? getUserData(user.id) : getUserData('')
    return user ? applyRecurringTransactions(raw) : raw
  })

  useEffect(() => {
    if (!user) return
    const local = applyRecurringTransactions(getUserData(user.id))
    if (local !== getUserData(user.id)) saveUserData(user.id, local)
    setData(local)
  }, [user])

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    if (!user) return
    setData(prev => {
      const next = applyRecurringTransactions(updater(prev))
      saveUserData(user.id, next)
      return next
    })
  }, [user])

  return (
    <DataContext.Provider value={{ data, updateData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}