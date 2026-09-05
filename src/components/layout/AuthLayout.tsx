import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'
import { ThemeToggle } from './ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to={PATHS.HOME} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-sm">
            ⚛
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{env.APP_NAME}</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {env.APP_NAME}.
      </div>
    </div>
  )
}
