// =========================================================
// General API Response Schemas
// =========================================================

export interface ResponseGeneral<T> {
  status: number
  message: string
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  amount: number
  totalElements?: number
  totalPages?: number
  page?: number
  size?: number
}

export interface CursorPageResponse<T> {
  content: T[]
  next_cursor?: number | null
  nextCursor?: number | null
  has_next?: boolean
  hasNext?: boolean
  total_elements?: number | null
  totalElements?: number | null
}

export interface FileUploadResponse {
  url: string
  file_name: string
  fileName?: string
  size: number
  content_type: string
  contentType?: string
}

// =========================================================
// Theme & UI Types
// =========================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface BreadcrumbItem {
  label: string
  to?: string
}

// =========================================================
// Family Tree Schemas
// =========================================================

export * from './family'
