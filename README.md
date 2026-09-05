# React 19 + TypeScript Base Project Starter

Base project React + TypeScript được thiết kế theo kiến trúc **feature-based** chuẩn mực (tham khảo [bulletproof-react](https://github.com/alan2207/bulletproof-react)). Dự án đã cấu hình sẵn toàn bộ các thành phần thiết yếu (Xác thực, phân quyền RBAC, Dark Mode, Axios Auto-Refresh token, CRUD BaseService, bộ UI Component, Layout) để bạn có thể sao chép và bắt đầu ngay bất kỳ dự án web nào trong tương lai.

**Tech Stack:**
- ⚡ **Vite 8** — Build tool siêu tốc, HMR tức thì
- ⚛️ **React 19** + **TypeScript** — Phiên bản React mới nhất với kiểu dữ liệu an toàn
- 🚦 **React Router 7** — Định tuyến SPA, hỗ trợ Lazy loading và Route guards
- 🌐 **Axios** — HTTP Client với cơ chế Interceptor làm mới Token tự động (Auto-refresh on 401)
- 🎨 **Tailwind CSS + CSS Design Tokens** — Hệ thống màu và theme 2 tầng (Light & Dark mode, Zero-FOUC)
- 🔍 **Oxlint** — Linter siêu nhanh thế hệ mới

---

## 🚀 Khởi chạy dự án

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env

# 3. Khởi chạy dev server (mặc định port 3000)
npm run dev

# 4. Kiểm tra mã nguồn (Linter)
npm run lint

# 5. Build kiểm tra bản đóng gói sản xuất
npm run build
```

---

## 📁 Cấu trúc thư mục

```
src/
├── app/                  # App entry & AppProvider (gom toàn bộ provider toàn cục)
│   ├── App.tsx
│   └── AppProvider.tsx   # ErrorBoundary > ThemeProvider > ToastProvider > AuthProvider
├── routes/               # Định tuyến SPA & đường dẫn tập trung
│   ├── paths.ts          # Hằng số đường dẫn PATHS duy nhất
│   └── index.tsx         # Khai báo lazy loading + route guards
├── config/               # env.ts — Đọc biến môi trường tại 1 nơi tập trung
├── constants/            # Hằng số dùng chung (STORAGE_KEYS, HTTP_STATUS...)
├── contexts/             # Các React Context toàn cục
│   ├── AuthProvider.tsx  # Quản lý phiên đăng nhập & thông tin User
│   ├── ThemeContext.tsx  # ThemeProvider (Light / Dark / System)
│   └── ToastContext.tsx  # Toast notification (Success, Error, Warning, Info)
├── hooks/                # Custom React Hooks
│   ├── useAuth.ts        # Hook truy cập AuthContext
│   ├── useTheme.ts       # Hook đổi theme Light / Dark / System
│   ├── useToast.ts       # Hook bật thông báo toast
│   ├── useDebounce.ts    # Debounce input tìm kiếm
│   ├── useFetch.ts       # Generic fetcher hook tự quản lý loading/error
│   └── useLocalStorage.ts
├── services/             # Tầng giao tiếp mạng (Network & API Layer)
│   ├── apiClient.ts      # Axios instance chính: chèn Bearer token + Auto-refresh 401
│   ├── BaseService.ts    # ⭐ Lớp cha cung cấp sẵn đầy đủ CRUD methods
│   ├── auth.service.ts   # API Đăng nhập, Đăng ký, OTP, Quên mật khẩu, Google
│   ├── user.service.ts   # Kế thừa BaseService<UserResponse>
│   ├── file.service.ts   # Upload file đơn/nhiều file (Multipart)
│   └── tokenStorage.ts   # Nơi duy nhất đọc/ghi token vào LocalStorage/Cookie
├── components/
│   ├── ui/               # Bộ UI Primitives tái sử dụng (Button, Input, Modal, Badge...)
│   ├── layout/           # MainLayout, AdminLayout, AuthLayout, Header, Footer...
│   └── common/           # ProtectedRoute, AdminRoute, GuestRoute, ErrorBoundary, Seo...
├── features/             # ⭐ Module tính năng nghiệp vụ (Feature-Based)
│   ├── auth/             # Màn hình LoginPage (Tabs: Login/Register/OTP/Reset), ProfilePage
│   ├── admin/            # AdminOverviewPage, AdminUsersPage, AdminSettingsPage
│   ├── users/            # Mẫu tính năng CRUD: UsersPage kèm debounce search & phân trang
│   └── home/             # Trang chủ giới thiệu template & UI Playground
├── styles/               # Hệ thống CSS Design Tokens
│   ├── base/             # variables.css (tokens --c-*), reset.css, layout.css
│   ├── utilities/        # buttons.css, cards.css, misc.css, toast.css
│   └── theme/            # dark.css, body-gradient.css
├── types/                # TypeScript interfaces chung (ResponseGeneral, PageResponse...)
└── utils/                # Hàm thuần tiện ích (formatDate, getErrorMessage, decodeJwt...)
```

---

## 💡 Các tính năng cốt lõi được xây dựng sẵn

### 1. Xác thực & Phân quyền (Auth & RBAC)
- **Luồng đăng nhập đầy đủ**:
  - Đăng nhập tài khoản & mật khẩu
  - Đăng ký nhận mã OTP kích hoạt qua Email
  - Xác thực mã OTP 6 chữ số
  - Quên mật khẩu & Đặt lại mật khẩu mới qua mã OTP
  - Đăng nhập nhanh qua Google (Sign-In with Google)
- **Quản lý Token thông minh (`apiClient.ts`)**:
  - Tự động đính kèm `Authorization: Bearer <access_token>`.
  - Tự động phát hiện token sắp hết hạn để refresh chủ động.
  - Khi API trả lỗi 401: Tự động gọi endpoint `/auth/refresh` và retry lại request gốc.
  - **Chống storm/race condition**: Khi có N request cùng fail 401 đồng thời, chỉ 1 request refresh duy nhất được gửi đi; các request còn lại chia sẻ chung Promise kết quả.
  - Hỗ trợ lưu trữ Refresh Token qua cookie `HttpOnly` an toàn (kèm fallback `tokenStorage`).
- **Route Guards**:
  - `<ProtectedRoute>`: Chặn truy cập nếu chưa đăng nhập, tự nhớ URL cần đến (`state: { from }`).
  - `<AdminRoute>`: Yêu cầu quyền `ADMIN`.
  - `<GuestRoute>`: Chuyển hướng người dùng đã đăng nhập về trang chủ nếu truy cập `/login` hoặc `/register`.

### 2. Kế thừa CRUD với `BaseService`
Bạn không cần viết lại các hàm gọi API lặp đi lặp lại. Khi có entity mới, chỉ cần 1 file ngắn:

```ts
// src/services/product.service.ts
import { BaseService } from './BaseService'
import type { Product, CreateProductDTO, UpdateProductDTO } from '@/types'

export class ProductService extends BaseService<Product, CreateProductDTO, UpdateProductDTO> {
  constructor() {
    super('/products')
  }
}

export const productService = new ProductService()
```

Có ngay các phương thức:
- `productService.getAll({ page: 0, size: 10, keyword: '...' })`
- `productService.getById(id)`
- `productService.create(data)`
- `productService.update(id, data)`
- `productService.patch(id, partialData)`
- `productService.delete(id)`

### 3. Giao diện & Dark/Light Theme (Zero-FOUC)
- Token màu `--c-*` được định nghĩa trong `src/styles/base/variables.css`.
- Chuyển đổi linh hoạt giữa 3 chế độ: `light` | `dark` | `system` qua hook `useTheme()`.
- Script inline trong `index.html` tự động phát hiện và áp dụng class `.dark` cùng `data-theme` trước paint đầu tiên, **hoàn toàn không có hiện tượng chớp trắng (Zero-FOUC)**.

### 4. Hệ thống Thông báo Toast (`useToast`)
Thông báo nổi góc màn hình tự động ẩn sau 4 giây, chống spam thông báo trùng lặp:

```tsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { toast } = useToast()

  return (
    <button onClick={() => toast('Cập nhật thành công!', 'success')}>
      Lưu
    </button>
  )
}
```
Hỗ trợ 4 loại thông báo: `'success' | 'error' | 'warning' | 'info'`.

---

## 🛠️ Hướng dẫn thêm một Tính năng mới (VD: Sản phẩm - Products)

### Bước 1: Khai báo kiểu dữ liệu và Service
Tạo thư mục `src/features/products/`:
```ts
// src/features/products/types.ts
export interface Product {
  id: number
  name: string
  price: number
  description?: string
}
```

Tạo service:
```ts
// src/services/product.service.ts
import { BaseService } from './BaseService'
import type { Product } from '@/features/products/types'

export const productService = new BaseService<Product>('/products')
```

### Bước 2: Tạo Trang hiển thị (Page)
```tsx
// src/features/products/pages/ProductsPage.tsx
import { useState, useEffect } from 'react'
import { productService } from '@/services/product.service'
import type { Product } from '../types'
import { Card, CardBody, Skeleton } from '@/components/ui'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getAll().then((res) => {
      setProducts(res.content)
      setLoading(false)
    })
  }, [])

  if (loading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((p) => (
        <Card key={p.id}>
          <CardBody>
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-amber-600 font-semibold">{p.price.toLocaleString()} đ</p>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
```

### Bước 3: Đăng ký Route
1. Thêm vào `src/routes/paths.ts`:
```ts
export const PATHS = {
  // ...
  PRODUCTS: '/products',
} as const
```
2. Thêm route vào `src/routes/index.tsx`:
```tsx
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage'))

// Trong danh sách children của MainLayout:
{ path: PATHS.PRODUCTS, element: <ProductsPage /> }
```

---

## 🛡️ Nguyên tắc thiết kế dự án
1. **Feature-based**: Mã nguồn của tính năng nào nằm gọn trong `features/<tên>`. Khi muốn gỡ bỏ tính năng, chỉ cần xóa thư mục tương ứng.
2. **Không hardcode**:
   - Đường dẫn: dùng `PATHS`
   - Biến môi trường: dùng `env`
   - LocalStorage key: dùng `STORAGE_KEYS`
3. **Nhất quán import alias**: Luôn dùng `@/` (ví dụ `@/components/ui`, `@/services/apiClient`), không dùng `../../..`.
4. **Code sạch & Tuân thủ Linter**: Chạy `npm run lint` để đảm bảo không có cảnh báo hoặc lỗi tiềm ẩn.

---

## 📄 Bản quyền & Sử dụng
Dự án được tạo ra dưới dạng **Starter Template / Boilerplate** mở, tự do sử dụng và tùy biến cho mọi dự án cá nhân hoặc thương mại.
