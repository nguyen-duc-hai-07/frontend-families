import { oplearnClient } from './oplearnClient'
import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types'
import { tokenStorage } from './tokenStorage'

export const authService = {
  async login(payload: LoginRequest): Promise<TokenResponse> {
    const res = await oplearnClient.post<any>('/auth/login', payload)
    const tokenData = res.data?.data || res.data
    tokenStorage.saveTokens(tokenData)
    return tokenData
  },

  async register(payload: RegisterRequest): Promise<void> {
    // Backend dùng Jackson SNAKE_CASE toàn cục nên gửi `phone_number`
    const body = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      phone_number: payload.phoneNumber ?? '',
    }
    await oplearnClient.post<any>('/auth/register', body)
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<TokenResponse> {
    const res = await oplearnClient.post<any>('/auth/verify-otp', {
      email: payload.email,
      otp: payload.otp,
    })
    const tokenData = res.data?.data || res.data
    tokenStorage.saveTokens(tokenData)
    return tokenData
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await oplearnClient.post<any>('/auth/forgot-password', {
      email: payload.email,
    })
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await oplearnClient.post<any>('/auth/reset-password', {
      email: payload.email,
      otp: payload.otp,
      new_password: payload.newPassword,
    })
  },

  async loginWithGoogle(token: string): Promise<TokenResponse> {
    const res = await oplearnClient.post<any>('/auth/login/google', { token })
    const tokenData = res.data?.data || res.data
    tokenStorage.saveTokens(tokenData)
    return tokenData
  },

  async logout(): Promise<void> {
    // Refresh token nằm ở cookie HttpOnly (withCredentials tự gửi) → luôn gọi
    // endpoint để BE thu hồi token + xoá cookie. Kèm token cũ ở body nếu còn
    // sót trong localStorage (user chưa migrate).
    try {
      const legacy = tokenStorage.getRefreshToken()
      await oplearnClient.post(
        '/auth/logout',
        legacy ? { refresh_token: legacy, refreshToken: legacy } : {},
      )
    } catch (err) {
      console.error('Logout request failed', err)
    }
    tokenStorage.clear()
  },
}
