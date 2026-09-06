
import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { FamilyProvider } from '@/contexts/FamilyContext'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <FamilyProvider>
            {children}
          </FamilyProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
