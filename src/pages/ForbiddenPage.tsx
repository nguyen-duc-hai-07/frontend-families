import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <Seo title="Truy cập bị từ chối (403)" noindex />
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl font-bold">
        🚫
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">403 - Quyền truy cập bị từ chối</h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
        Bạn không có đủ quyền hạn (cần quyền Administrator) để truy cập vào tài nguyên này.
      </p>
      <Link to={PATHS.HOME}>
        <Button variant="primary">
          ← Trở về Trang Chủ
        </Button>
      </Link>
    </div>
  )
}
