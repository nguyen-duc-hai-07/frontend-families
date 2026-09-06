import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'
import { useFamily } from '@/hooks/useFamily'

export function Footer() {
  const { currentFamily } = useFamily()

  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-sm">
                🌳
              </div>
              <span className="font-bold text-slate-900 dark:text-amber-100 text-lg">
                {env.APP_NAME}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Hệ thống quản lý và trực quan hóa Cây Phả Hệ Dòng Họ tương tác mở. Tất cả thành viên đều có quyền đóng góp, ghi chép và lưu giữ cội nguồn tổ tiên.
            </p>
            {currentFamily && (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Đang xem: {currentFamily.name}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-amber-200">
              Chức năng chính
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to={PATHS.HOME} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  🌳 Sơ đồ Cây Phả Hệ
                </Link>
              </li>
              <li>
                <Link to={PATHS.PERSONS} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  👥 Danh sách Thành viên
                </Link>
              </li>
              <li>
                <Link to={PATHS.RELATIONS} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  🔗 Thiết lập Quan hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Storage & Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-amber-200">
              Tư liệu & Hệ thống
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to={PATHS.FAMILY_INFO} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  🏛️ Thông tin Dòng họ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} {env.APP_NAME}. Gìn giữ cội nguồn - Phát huy truyền thống.</p>
          <p className="flex items-center gap-2">
            <span>React 19</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Spring Boot</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
