import { useState, useEffect, useRef, type ReactNode } from 'react'
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

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'
      return isDark ? 'dark' : 'light'
    }
    return 'light'
  })

  const isFirstRender = useRef(true)

  useEffect(() => {
    const applyDOMTheme = (resolved: 'light' | 'dark') => {
      const root = document.documentElement
      root.setAttribute('data-theme', resolved)
      root.classList.toggle('dark', resolved === 'dark')
    }

    const resolveTheme = (t: ThemeMode): 'light' | 'dark' => {
      if (t === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return t
    }

    const nextResolved = resolveTheme(theme)
    setActualTheme(nextResolved)

    if (isFirstRender.current) {
      isFirstRender.current = false
      applyDOMTheme(nextResolved)
    } else {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Use modern View Transition API if supported for a seamless, flicker-free crossfade
      if (
        !prefersReducedMotion &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document
      ) {
        document.documentElement.classList.add('theme-transitioning')
        const transition = (document as any).startViewTransition(() => {
          applyDOMTheme(nextResolved)
        })
        transition.finished.finally(() => {
          document.documentElement.classList.remove('theme-transitioning')
        })
      } else {
        applyDOMTheme(nextResolved)
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => {
        const sysResolved = mediaQuery.matches ? 'dark' : 'light'
        setActualTheme(sysResolved)
        applyDOMTheme(sysResolved)
      }
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

