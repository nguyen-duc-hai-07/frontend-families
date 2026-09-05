import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '@/services/user.service'
import { PATHS } from '@/routes/paths'
import { Seo } from '@/components/common/Seo'
import { Card, CardHeader, CardTitle, CardBody, Badge, Button } from '@/components/ui'
import { IconUser, IconShieldCheck } from '@/components/ui/icons'
import type { UserResponse } from '@/types'
import { formatDate } from '@/utils/format'

export default function AdminOverviewPage() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [recentUsers, setRecentUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const res = await userService.getUsers({ page: 0, size: 5 })
        setTotalUsers(res.amount || res.totalElements || res.content?.length || 0)
        setRecentUsers(res.content || [])
      } catch (err) {
        console.error('Lỗi tải dữ liệu admin dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      <Seo title="Quản trị hệ thống" noindex />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">Bảng điều khiển quản trị</h1>
        <p className="text-[var(--c-muted)] text-sm mt-1">Tổng quan hoạt động và số liệu hệ thống</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--c-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Người dùng</span>
            <IconUser size={18} className="text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-[var(--c-heading)]">
            {loading ? '...' : totalUsers}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">● Hoạt động bình thường</p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--c-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Hệ thống API</span>
            <IconShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">Online</p>
          <p className="text-[11px] text-[var(--c-muted)]">Độ trễ trung bình ~85ms</p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--c-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Phiên bản</span>
            <span className="text-xs font-mono text-amber-600 font-bold">v1.0.0</span>
          </div>
          <p className="text-3xl font-bold text-[var(--c-heading)]">React 19</p>
          <p className="text-[11px] text-[var(--c-muted)]">Vite 8 · TypeScript · Tailwind</p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--c-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Xác thực</span>
            <span className="text-xs text-amber-600">JWT + Cookie</span>
          </div>
          <p className="text-3xl font-bold text-[var(--c-heading)]">RBAC</p>
          <p className="text-[11px] text-emerald-600 font-medium">Tự động làm mới token</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[var(--c-heading)]">Lối tắt quản lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to={PATHS.ADMIN_USERS}
            className="p-4 rounded-xl bg-[var(--c-surface-2)] hover:border-amber-500 border border-[var(--c-border)] transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              👥
            </div>
            <div>
              <p className="font-bold text-[var(--c-heading)] group-hover:text-amber-600 transition-colors">
                Quản lý Người dùng
              </p>
              <p className="text-xs text-[var(--c-muted)]">Thêm, sửa, phân quyền tài khoản</p>
            </div>
          </Link>

          <Link
            to={PATHS.ADMIN_SETTINGS}
            className="p-4 rounded-xl bg-[var(--c-surface-2)] hover:border-amber-500 border border-[var(--c-border)] transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <p className="font-bold text-[var(--c-heading)] group-hover:text-amber-600 transition-colors">
                Cài đặt hệ thống
              </p>
              <p className="text-xs text-[var(--c-muted)]">Cấu hình biến môi trường & API</p>
            </div>
          </Link>

          <Link
            to={PATHS.HOME}
            className="p-4 rounded-xl bg-[var(--c-surface-2)] hover:border-amber-500 border border-[var(--c-border)] transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              🏠
            </div>
            <div>
              <p className="font-bold text-[var(--c-heading)] group-hover:text-emerald-600 transition-colors">
                Về Trang chủ
              </p>
              <p className="text-xs text-[var(--c-muted)]">Xem giao diện phía người dùng</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Người dùng mới đăng ký</CardTitle>
          <Link to={PATHS.ADMIN_USERS}>
            <Button variant="ghost">Xem tất cả →</Button>
          </Link>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-xs text-[var(--c-muted)] py-4">Đang tải danh sách người dùng...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-xs text-[var(--c-muted)] py-4">Chưa có người dùng nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--c-divider)] text-xs uppercase text-[var(--c-muted)] font-semibold">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Tên đăng nhập</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Vai trò</th>
                    <th className="py-3 px-2">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-divider)]">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--c-surface-2)] transition-colors">
                      <td className="py-3 px-2 text-xs font-mono text-[var(--c-muted)]">#{u.id}</td>
                      <td className="py-3 px-2 font-semibold text-[var(--c-text)]">{u.username}</td>
                      <td className="py-3 px-2 text-xs text-[var(--c-muted)]">{u.email || '—'}</td>
                      <td className="py-3 px-2">
                        <Badge variant={u.role === 'ADMIN' ? 'warning' : 'primary'} size="sm">
                          {u.role || 'USER'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-xs text-[var(--c-muted)]">
                        {u.createdAt || u.created_at ? formatDate(u.createdAt || u.created_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
