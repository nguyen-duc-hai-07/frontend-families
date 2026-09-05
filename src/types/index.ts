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
// Auth & User Schemas
// =========================================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserResponse {
  id: number
  username: string
  email: string
  phoneNumber?: string
  phone_number?: string
  phone?: string
  role: UserRole | string
  avatarUrl?: string
  avatar_url?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  user?: UserResponse
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  phoneNumber?: string
  phone_number?: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
  otp_code?: string
  otpCode?: string
  code?: string
}

export interface ForgotPasswordRequest {
  email: string
  username?: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  otp_code?: string
  otpCode?: string
  code?: string
  newPassword?: string
  new_password?: string
  password?: string
  confirmPassword?: string
  confirm_password?: string
}

export interface RefreshTokenRequest {
  refreshToken?: string
  refresh_token?: string
}

export interface GoogleLoginRequest {
  token: string
}

// =========================================================
// Theme & UI Types
// =========================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface BreadcrumbItem {
  label: string
  to?: string
}
