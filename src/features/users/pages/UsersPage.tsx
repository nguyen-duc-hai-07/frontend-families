import { useState, useEffect, useCallback } from 'react'
import { userService } from '@/services/user.service'
import type { UserResponse } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Seo } from '@/components/common/Seo'
import { Card, CardBody, Badge, Pagination, PageSizeSelect, Skeleton } from '@/components/ui'
import { IconSearch } from '@/components/ui/icons'
import { formatDate } from '@/utils/format'

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userService.getUsers({
        keyword: debouncedKeyword.trim() || undefined,
        page,
        size,
      })
      setUsers(res.content || [])
      setTotalAmount(res.amount || res.totalElements || res.content?.length || 0)
    } catch (err) {
      console.error('Lỗi nạp danh sách người dùng:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, page, size])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalPages = Math.ceil(totalAmount / size) || 1

  return (
    <div className="space-y-6">
      <Seo title="Danh sách người dùng & Demo CRUD" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">
            Người dùng & Mẫu Feature CRUD
          </h1>
          <p className="text-sm text-[var(--c-muted)] mt-1">
            Ví dụ mẫu về cách tổ chức tính năng: Service kế thừa BaseService → Hook debounce → Trang hiển thị kèm phân trang.
          </p>
        </div>

        <div className="text-xs font-semibold text-[var(--c-muted)] bg-[var(--c-surface-2)] px-3 py-1.5 rounded-xl border border-[var(--c-border)]">
          Tổng cộng: <span className="text-amber-600 font-bold">{totalAmount}</span> người dùng
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-muted-2)]">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            className="w-full pl-10 pr-4 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder-[var(--c-muted-2)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <PageSizeSelect
            value={size}
            onChange={(newSize) => {
              setSize(newSize)
              setPage(0)
            }}
            options={[6, 12, 24, 48]}
            unit="người"
          />
        </div>
      </div>

      {/* Grid of Users */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full mt-2" />
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-base text-[var(--c-muted)]">
            {keyword ? `Không tìm thấy người dùng nào phù hợp với từ khóa "${keyword}".` : 'Chưa có dữ liệu người dùng.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {users.map((u) => (
            <Card key={u.id} className="hover:border-amber-500/50 transition-all group">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {u.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <Badge variant={u.role === 'ADMIN' ? 'warning' : 'primary'} size="sm">
                    {u.role || 'USER'}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[var(--c-heading)] group-hover:text-amber-600 transition-colors truncate">
                    {u.username}
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] truncate mt-0.5">
                    {u.email || 'Chưa có email'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--c-divider)] text-[11px] text-[var(--c-muted)] flex justify-between items-center">
                  <span>ID: #{u.id}</span>
                  <span>{u.createdAt || u.created_at ? formatDate(u.createdAt || u.created_at) : ''}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  )
}
