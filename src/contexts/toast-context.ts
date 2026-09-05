import { createContext } from 'react'

export type ToastType = 'error' | 'success' | 'info' | 'warning'

export interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)
