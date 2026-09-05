import { useContext } from 'react'
import { ToastContext, type ToastContextType } from '@/contexts/toast-context'

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export type { ToastType, ToastContextType } from '@/contexts/toast-context'
