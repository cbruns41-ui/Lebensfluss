import { useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeSync() {
  const { data } = useData()
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(data.settings.theme)
  }, [data.settings.theme, setTheme])

  return null
}