import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastType } from './toast-context'

interface ToastItem {
  id: number
  title?: string
  message: string
  type: ToastType
}

const MAX_TOASTS = 4
const DEDUP_MS = 3000
const DURATION_MS = 4000

function iconFor(type: ToastType): string {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '!'
    case 'warning': return '⚠'
    default: return 'i'
  }
}

const DEFAULT_TITLES: Record<ToastType, string> = {
  error: 'Có lỗi xảy ra',
  success: 'Thành công',
  warning: 'Cảnh báo',
  info: 'Thông báo',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const lastShown = useRef(new Map<string, number>())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const key = `${type}|${title ?? ''}|${message}`
      const now = Date.now()
      const prev = lastShown.current.get(key)
      if (prev !== undefined && now - prev < DEDUP_MS) return
      lastShown.current.set(key, now)

      const id = nextId.current++
      setToasts((curr) => [...curr, { id, title, message, type }].slice(-MAX_TOASTS))
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-stack" role="region" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast toast--${t.type}`}
              role="status"
              onClick={() => dismiss(t.id)}
            >
              <span className="toast-ico" aria-hidden="true">{iconFor(t.type)}</span>
              <div className="toast-body">
                <div className="toast-title">{t.title ?? DEFAULT_TITLES[t.type]}</div>
                <div className="toast-desc">{t.message}</div>
              </div>
              <button
                type="button"
                className="toast-close"
                aria-label="Đóng thông báo"
                onClick={(e) => {
                  e.stopPropagation()
                  dismiss(t.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
