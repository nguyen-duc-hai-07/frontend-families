import { createContext } from 'react'

export type ToastType = 'error' | 'success' | 'info' | 'warning'

export interface ToastFunction {
  (message: string, type?: ToastType, title?: string): void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

export interface ToastContextType {
  toast: ToastFunction
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)
