import { useState, useEffect, type ReactNode } from 'react'
import type { ThemeMode } from '@/types'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'app_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
      const legacy = localStorage.getItem('poems_reader_style_mode')
      if (legacy === 'modern-dark') return 'dark'
      if (legacy === 'modern-light') return 'light'
    } catch {
      // Ignore storage errors
    }
    return 'system'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateTheme = () => {
      let resolved: 'light' | 'dark' = 'light'
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolved = theme
      }

      setActualTheme(resolved)

      const root = document.documentElement
      root.setAttribute('data-theme', resolved)
      root.classList.toggle('dark', resolved === 'dark')
    }

    updateTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => updateTheme()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [theme])

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme)
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Ignore
    }
  }

  const toggleTheme = () => {
    if (actualTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
