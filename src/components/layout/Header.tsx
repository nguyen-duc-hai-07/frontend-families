import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'
import { useFamily } from '@/hooks/useFamily'
import { ThemeToggle } from './ThemeToggle'
import { IconX } from '@/components/ui/icons'

const NAV_LINKS = [
  { to: PATHS.HOME, label: '🌳 Cây Phả Hệ', end: true },
  { to: PATHS.PERSONS, label: '👥 Thành Viên', end: false },
  { to: PATHS.RELATIONS, label: '🔗 Quan Hệ', end: false },
  { to: PATHS.FAMILY_INFO, label: '🏛️ Dòng Họ', end: false },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
    isActive
      ? 'text-amber-900 bg-amber-100/90 dark:text-amber-200 dark:bg-amber-950/70 shadow-xs'
      : 'text-slate-600 hover:text-amber-700 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-amber-300 dark:hover:bg-slate-800/60'
  }`

export function Header() {
  const { currentFamilyId, currentFamily, recentFamilies, setCurrentFamilyId } = useFamily()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <Link to={PATHS.HOME} className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            🌳
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-amber-100 tracking-tight block">
              {env.APP_NAME}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium block -mt-0.5">
              Hệ thống Phả Hệ Mở
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Header Right Actions: Family Switcher + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Family Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFamilyDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-amber-200/60 dark:border-slate-700 text-amber-900 dark:text-amber-200 transition-colors max-w-[200px] truncate"
              title="Đổi dòng họ đang chọn"
            >
              <span className="text-amber-600">🏛️</span>
              <span className="truncate">
                {currentFamily?.name || `Dòng họ #${currentFamilyId}`}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {familyDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in"
                onMouseLeave={() => setFamilyDropdownOpen(false)}
              >
                <div className="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dòng họ đã chọn
                </div>

                <div className="py-1 space-y-1 max-h-48 overflow-y-auto">
                  {recentFamilies.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setCurrentFamilyId(f.id)
                        setFamilyDropdownOpen(false)
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        f.id === currentFamilyId
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] opacity-70">#{f.id}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    to={PATHS.FAMILY_INFO}
                    onClick={() => setFamilyDropdownOpen(false)}
                    className="block text-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline py-1.5"
                  >
                    + Quản lý & Tạo dòng họ mới
                  </Link>
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
        <div className="lg:hidden border-t border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
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
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
