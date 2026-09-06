import axios, { type AxiosError } from 'axios'
import { env } from '@/config/env'

export const apiClient = axios.create({
  baseURL: env.API_URL || env.OPLEARN_API_URL || 'http://localhost:8088/api/v1',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'vi',
  },
})

// Response interceptor: log or parse errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const errorData = error.response?.data
    const errorMessage =
      errorData?.data?.message ||
      errorData?.message ||
      error.message ||
      'Đã xảy ra lỗi kết nối tới máy chủ'

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      details: errorData,
    })

    return Promise.reject(error)
  },
)

export default apiClient
