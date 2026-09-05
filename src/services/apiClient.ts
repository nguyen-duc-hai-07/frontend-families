import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { HTTP_STATUS } from '@/constants'
import { decodeJwt } from '@/utils/jwt'
import { tokenStorage } from './tokenStorage'

export const apiClient = axios.create({
  baseURL: env.API_URL || env.OPLEARN_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Flag to avoid multiple session expiration notifications during a 401 burst.
 */
let sessionExpiredNotified = false

export function resetSessionExpired(): void {
  sessionExpiredNotified = false
}

/**
 * Checks if the JWT access token is expired or within 5s of expiring.
 */
function isAccessTokenExpired(token: string): boolean {
  const claims = decodeJwt(token)
  if (!claims || typeof claims.exp !== 'number') return false
  return claims.exp * 1000 <= Date.now() + 5000
}

let refreshPromise: Promise<boolean> | null = null

/**
 * Refreshes the access token using either the HttpOnly cookie or stored refresh token.
 */
async function attemptRefresh(): Promise<boolean> {
  if (sessionExpiredNotified) return false
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const legacyRefreshToken = tokenStorage.getRefreshToken()
    const refreshBaseUrl = env.API_URL || env.OPLEARN_API_URL
    try {
      const res = await axios.post<any>(
        `${refreshBaseUrl}/auth/refresh`,
        legacyRefreshToken ? { refresh_token: legacyRefreshToken, refreshToken: legacyRefreshToken } : {},
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const tokenData = res.data?.data ?? res.data
      const newAccessToken =
        tokenData?.accessToken || tokenData?.access_token || tokenData?.token
      if (!newAccessToken) return false

      tokenStorage.saveTokens(tokenData)
      tokenStorage.removeRefreshToken()
      sessionExpiredNotified = false
      return true
    } catch {
      return false
    }
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

// Request Interceptor: inject Bearer token and proactively refresh if expired
apiClient.interceptors.request.use(async (config) => {
  const url = config.url ?? ''
  const isAuthEndpoint = url.includes('/auth/')
  const token = tokenStorage.getAccessToken()

  if (token && !isAuthEndpoint && isAccessTokenExpired(token)) {
    await attemptRefresh()
  }

  const freshToken = tokenStorage.getAccessToken()
  if (freshToken && config.headers) {
    config.headers.Authorization = `Bearer ${freshToken}`
  }
  return config
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

// Response Interceptor: handle 401, auto-refresh and retry request
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthEndpoint = config?.url?.includes('/auth/') ?? false

    if (error.response?.status !== HTTP_STATUS.UNAUTHORIZED || !config || config._retried || isAuthEndpoint) {
      throw error
    }

    config._retried = true
    const tokenUsed = config.headers?.Authorization

    const ok = await attemptRefresh()
    if (ok) {
      const freshToken = tokenStorage.getAccessToken()
      if (freshToken && config.headers) {
        config.headers.Authorization = `Bearer ${freshToken}`
      }
      return apiClient(config)
    }

    // Check if another tab refreshed the token
    const currentToken = tokenStorage.getAccessToken()
    if (currentToken && `Bearer ${currentToken}` !== tokenUsed) {
      if (config.headers) config.headers.Authorization = `Bearer ${currentToken}`
      return apiClient(config)
    }

    // Session genuinely expired
    if (!sessionExpiredNotified) {
      sessionExpiredNotified = true
      tokenStorage.clear()
      try {
        window.dispatchEvent(new Event('auth-session-expired'))
        window.dispatchEvent(new Event('poems-session-expired'))
      } catch {
        // Ignore if running outside browser
      }
    }

    throw error
  },
)

export default apiClient
