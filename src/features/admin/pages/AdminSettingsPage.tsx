import { useState } from 'react'
import { Seo } from '@/components/common/Seo'
import { Card, CardHeader, CardTitle, CardBody, Button, Input, Badge } from '@/components/ui'
import { env } from '@/config/env'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [appName, setAppName] = useState(env.APP_NAME)
  const [apiUrl, setApiUrl] = useState(env.API_URL || env.OPLEARN_API_URL)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast('Đã lưu cấu hình giả lập! (Trong thực tế các giá trị này đọc từ file .env)', 'success')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Seo title="Cài đặt hệ thống" noindex />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">Cài đặt hệ thống</h1>
        <p className="text-[var(--c-muted)] text-sm mt-1">
          Xem và quản lý các thông số cấu hình của ứng dụng và máy chủ backend
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biến môi trường hiện tại (.env)</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input
              label="Tên ứng dụng (VITE_APP_NAME)"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
            <Input
              label="Địa chỉ API backend (VITE_API_URL)"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-[var(--c-text)]">
                Môi trường chạy hiện tại:
              </label>
              <div className="flex items-center gap-3">
                <Badge variant={env.IS_DEV ? 'warning' : 'success'}>
                  {env.IS_DEV ? 'Development (Vite Dev Server)' : 'Production Build'}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Lưu cài đặt
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiên đăng nhập & phân quyền</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Tài khoản quản trị:</span>
              <span className="font-semibold text-[var(--c-text)]">{user?.username || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Vai trò (Role):</span>
              <Badge variant="warning">{user?.role || 'ADMIN'}</Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Cơ chế xác thực token:</span>
              <span className="text-[var(--c-text)]">JWT Access Token + Refresh Token (HttpOnly Cookie)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--c-muted)]">Trạng thái làm mới tự động:</span>
              <span className="text-emerald-600 font-semibold">Đang kích hoạt qua Axios Interceptor</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
