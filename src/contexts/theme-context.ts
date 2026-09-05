import { createContext } from 'react'
import type { ThemeMode } from '@/types'

export interface ThemeContextType {
  theme: ThemeMode
  actualTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)
