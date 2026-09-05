import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { env } from '@/config/env'
import { Seo } from '@/components/common/Seo'
import { Button, Badge, Card, CardHeader, CardTitle, CardBody, Modal, Input } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  // Interactive playground states
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [demoInput, setDemoInput] = useState('')

  const handleTestLoading = () => {
    setLoadingBtn(true)
    setTimeout(() => {
      setLoadingBtn(false)
      toast('Thao tác thành công!', 'success')
    }, 1500)
  }

  return (
    <div className="space-y-16 py-4">
      <Seo title={`${env.APP_NAME} – Starter Template`} />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-semibold shadow-sm">
          <span>⚡</span>
          <span>Sẵn sàng cho sản xuất (Production-Ready)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--c-heading)] leading-tight">
          Khung Base Project Chuẩn Cho <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
            React 19 & TypeScript
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[var(--c-muted)] max-w-2xl mx-auto leading-relaxed">
          Nền tảng khởi tạo nhanh chóng với kiến trúc Feature-Based, xác thực JWT đa lớp, phân quyền RBAC, theme tối/sáng và bộ component UI tái sử dụng.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to={PATHS.USERS}>
            <Button variant="primary" className="!px-6 !py-3 !text-base">
              Xem Mẫu Feature CRUD →
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to={PATHS.PROFILE}>
              <Button variant="secondary" className="!px-6 !py-3 !text-base">
                👤 Xem Hồ sơ ({user?.username})
              </Button>
            </Link>
          ) : (
            <Link to={PATHS.LOGIN}>
              <Button variant="secondary" className="!px-6 !py-3 !text-base">
                🔐 Đăng nhập hệ thống
              </Button>
            </Link>
          )}
        </div>

        {/* Tech Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            Vite 8
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            React 19
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            TypeScript 5+
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            React Router 7
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            Axios Auto-Refresh
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--c-surface-2)] text-[var(--c-text)] border border-[var(--c-border)]">
            Tailwind CSS
          </span>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">
            Tại sao nên dùng Base Project này?
          </h2>
          <p className="text-sm text-[var(--c-muted)]">
            Tất cả những cấu hình cơ bản, tốn thời gian đã được thiết lập sẵn sàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
                🔐
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">Xác Thực & Phân Quyền (RBAC)</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Hệ thống Auth hoàn chỉnh: Đăng nhập, Đăng ký, OTP email, Quên/Đặt lại mật khẩu, Google Sign-in. Quản lý vai trò ADMIN và USER qua ProtectedRoute & AdminRoute.
              </p>
            </CardBody>
          </Card>

          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
                🌐
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">Axios Client & Auto-Refresh</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Tự động chèn Bearer token, làm mới token tự động khi gặp 401 (chống nghẽn race-condition đa luồng), hỗ trợ refresh token qua HttpOnly Cookie an toàn.
              </p>
            </CardBody>
          </Card>

          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                📦
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">BaseService CRUD Tiện Lợi</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Lớp cha <code>BaseService&lt;T&gt;</code> cung cấp đủ <code>getAll</code>, <code>getById</code>, <code>create</code>, <code>update</code>, <code>delete</code> chỉ với 1 dòng kế thừa.
              </p>
            </CardBody>
          </Card>

          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center text-2xl font-bold">
                🎨
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">Giao Diện & Dark Mode</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Thiết kế theo chuẩn CSS tokens với hỗ trợ Sáng (Light) / Tối (Dark) / Theo hệ thống (System). Khởi tạo ngay trong thẻ <code>&lt;head&gt;</code> chống nháy trắng (zero-FOUC).
              </p>
            </CardBody>
          </Card>

          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">
                🧩
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">Component UI Đầy Đủ</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Bộ UI primitives tái sử dụng: Button, Input, Select, Textarea, Modal, ConfirmDialog, Badge, Pagination, PageSizeSelect, Skeleton, Spinner, Toast.
              </p>
            </CardBody>
          </Card>

          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center text-2xl font-bold">
                📁
              </div>
              <h3 className="font-bold text-lg text-[var(--c-heading)]">Kiến Trúc Feature-Based</h3>
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                Tổ chức code theo tính năng (bulletproof-react). Mỗi feature tự quản lý types, services, hooks, components và pages. Dễ bảo trì và mở rộng lâu dài.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Interactive UI Playground Showcase */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">
            Thử Nghiệm Trực Tiếp (UI Playground)
          </h2>
          <p className="text-sm text-[var(--c-muted)]">
            Tương tác thử với các component được dựng sẵn trong template
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons & Loading Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>1. Buttons & Trạng thái Loading</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>

              <div className="pt-2 border-t border-[var(--c-divider)]">
                <p className="text-xs text-[var(--c-muted)] mb-2">Bấm thử nút dưới để xem hiệu ứng spinner:</p>
                <Button variant="primary" loading={loadingBtn} onClick={handleTestLoading}>
                  {loadingBtn ? 'Đang xử lý...' : 'Bấm để nạp dữ liệu'}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Toast Alerts Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>2. Thông báo Toast</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-xs text-[var(--c-muted)]">Bấm vào các nút để kích hoạt thông báo góc trên bên phải:</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast('Thao tác đã được lưu thành công!', 'success')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Success Toast
                </button>
                <button
                  type="button"
                  onClick={() => toast('Đã xảy ra sự cố trong quá trình xử lý.', 'error')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Error Toast
                </button>
                <button
                  type="button"
                  onClick={() => toast('Vui lòng kiểm tra lại thông tin nhập liệu.', 'warning')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Warning Toast
                </button>
                <button
                  type="button"
                  onClick={() => toast('Hệ thống có phiên bản cập nhật mới.', 'info')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Info Toast
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>3. Badges & Trạng thái</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="danger">Blocked</Badge>
                <Badge variant="neutral">Draft</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" size="sm">Small Tag</Badge>
                <Badge variant="warning" size="sm">Reviewing</Badge>
                <Badge variant="danger" size="sm">Failed</Badge>
              </div>
            </CardBody>
          </Card>

          {/* Modal Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>4. Hộp thoại Modal & Form Input</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-xs text-[var(--c-muted)]">Hộp thoại bật nổi với backdrop blur, phím Esc và đóng khi click ngoài:</p>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Mở Modal Demo
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Code Quickstart Guide */}
      <section className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--c-heading)]">
            Cách Thêm Một Feature Mới (Ví dụ: Products)
          </h2>
          <p className="text-sm text-[var(--c-muted)] mt-1">
            Chỉ với 3 bước đơn giản, bạn có ngay một tính năng hoàn chỉnh từ API tới giao diện
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--c-heading)]">
              Bước 1: Khởi tạo Service kế thừa <code>BaseService</code>
            </h4>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
              <p className="text-slate-400">// src/services/product.service.ts</p>
              <p><span className="text-purple-400">import</span> &#123; BaseService &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'./BaseService'</span></p>
              <p><span className="text-purple-400">import type</span> &#123; Product &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@/types'</span></p>
              <br />
              <p><span className="text-purple-400">export class</span> <span className="text-amber-300">ProductService</span> <span className="text-purple-400">extends</span> <span className="text-amber-300">BaseService</span>&lt;Product&gt; &#123;</p>
              <p>&nbsp;&nbsp;<span className="text-purple-400">constructor</span>() &#123; <span className="text-purple-400">super</span>(<span className="text-emerald-300">'/products'</span>) &#125;</p>
              <p>&#125;</p>
              <p><span className="text-purple-400">export const</span> productService = <span className="text-purple-400">new</span> <span className="text-amber-300">ProductService</span>()</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--c-heading)]">
              Bước 2: Đăng ký đường dẫn trong <code>src/routes/paths.ts</code>
            </h4>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
              <p><span className="text-purple-400">export const</span> PATHS = &#123;</p>
              <p>&nbsp;&nbsp;PRODUCTS: <span className="text-emerald-300">'/products'</span>,</p>
              <p>&nbsp;&nbsp;PRODUCT_DETAIL: <span className="text-emerald-300">'/products/:id'</span>,</p>
              <p>&#125; <span className="text-purple-400">as const</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--c-heading)]">
              Bước 3: Khai báo Route trong <code>src/routes/index.tsx</code>
            </h4>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
              <p><span className="text-purple-400">const</span> ProductsPage = <span className="text-amber-300">lazy</span>(() =&gt; <span className="text-purple-400">import</span>(<span className="text-emerald-300">'@/features/products/pages/ProductsPage'</span>))</p>
              <br />
              <p><span className="text-slate-400">// Thêm vào danh sách children của MainLayout:</span></p>
              <p>&#123; path: PATHS.PRODUCTS, element: &lt;<span className="text-amber-300">ProductsPage</span> /&gt; &#125;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal Dialog */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Hộp thoại Modal Mẫu" maxWidth="md">
        <div className="space-y-4">
          <p className="text-sm text-[var(--c-text)]">
            Đây là component Modal được đóng gói sẵn với độ mờ backdrop, header và nút đóng chuẩn.
          </p>
          <Input
            label="Thử nhập dữ liệu"
            placeholder="Nhập vào đây..."
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast(`Bạn vừa gửi: "${demoInput || 'chưa nhập gì'}"`, 'info')
                setModalOpen(false)
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
