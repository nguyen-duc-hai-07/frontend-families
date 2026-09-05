import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'
import { UserDropdown } from './UserDropdown'
import { ThemeToggle } from './ThemeToggle'
import { IconX } from '@/components/ui/icons'

const NAV_LINKS = [
  { to: PATHS.HOME, label: 'Trang chủ', end: true },
  { to: PATHS.USERS, label: 'Người dùng & CRUD', end: false },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
    isActive
      ? 'text-amber-900 bg-amber-100/80 dark:text-amber-200 dark:bg-amber-950/60 shadow-sm'
      : 'text-slate-600 hover:text-amber-700 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-amber-300 dark:hover:bg-slate-800/60'
  }`

export function Header() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur border-b border-slate-200/70 dark:border-slate-800/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <Link to={PATHS.HOME} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ⚛
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-amber-100 tracking-tight">
            {env.APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to={PATHS.ADMIN} className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={PATHS.LOGIN}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-amber-800 dark:text-amber-200 bg-amber-100/80 hover:bg-amber-200/70 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to={PATHS.REGISTER}
                className="hidden sm:inline-block px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileOpen ? (
              <IconX size={20} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-900 bg-amber-100 dark:text-amber-200 dark:bg-amber-950/60 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to={PATHS.ADMIN}
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800"
              >
                Admin Dashboard
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
