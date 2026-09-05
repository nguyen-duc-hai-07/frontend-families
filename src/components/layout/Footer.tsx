import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                ⚛
              </div>
              <span className="font-bold text-slate-900 dark:text-amber-100 text-lg">
                {env.APP_NAME}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Base template React 19 + TypeScript + Vite + Tailwind CSS. Được tối ưu hóa cho kiến trúc module, phân quyền, quản lý token và mở rộng nhanh chóng.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-amber-200">
              Điều hướng
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to={PATHS.HOME} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to={PATHS.USERS} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Quản lý Người dùng
                </Link>
              </li>
              <li>
                <Link to={PATHS.PROFILE} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Hồ sơ cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-amber-200">
              Tài khoản
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to={PATHS.LOGIN} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to={PATHS.REGISTER} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Đăng ký tài khoản
                </Link>
              </li>
              <li>
                <Link to={PATHS.ADMIN} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Khu vực Quản trị
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} {env.APP_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>React 19</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Vite</span>
            <span>•</span>
            <span>Axios Auto-Refresh</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
