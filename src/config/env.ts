/**
 * Centralized environment configuration.
 * All application code should import `env` from this file rather than reading `import.meta.env` directly.
 */
export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8088/api/v1',
  OPLEARN_API_URL: import.meta.env.VITE_OPLEARN_API_URL ?? 'http://localhost:8088/api/v1',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'Phả Hệ Dòng Họ',
  IS_DEV: import.meta.env.DEV,
} as const
