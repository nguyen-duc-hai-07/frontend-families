import { Suspense } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/Skeleton'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { IconDashboard, IconUser, IconSettings, IconArrowLeft } from '@/components/ui/icons'

const ADMIN_NAV = [
  { to: PATHS.ADMIN, label: 'Tổng quan', icon: IconDashboard, exact: true },
  { to: PATHS.ADMIN_USERS, label: 'Quản lý Người dùng', icon: IconUser },
  { to: PATHS.ADMIN_SETTINGS, label: 'Cài đặt hệ thống', icon: IconSettings },
]

export function AdminLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--c-surface)] border-b md:border-b-0 md:border-r border-[var(--c-border)] p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--c-divider)]">
            <Link to={PATHS.ADMIN} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                ⚙
              </div>
              <span className="font-bold text-base text-[var(--c-heading)]">Trang Quản Trị</span>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-[var(--c-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[var(--c-divider)] mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--c-muted)] font-medium">Giao diện</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--c-muted)] pt-1">
            <div>
              <p className="font-bold text-[var(--c-heading)] truncate max-w-[120px]">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">ADMINISTRATOR</p>
            </div>
            <Link to={PATHS.HOME} className="flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-semibold">
              <IconArrowLeft size={14} />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl bg-[var(--c-surface-2)] w-full" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
