import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminRoute } from '@/components/common/AdminRoute'
import { GuestRoute } from '@/components/common/GuestRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PATHS } from './paths'

// Lazy load Pages
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'))

// Lazy load Admin Pages
const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage'))
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage'))

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: PATHS.HOME, element: <HomePage /> },
      { path: PATHS.USERS, element: <UsersPage /> },
      {
        path: PATHS.LOGIN,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: PATHS.REGISTER,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: PATHS.FORGOT_PASSWORD,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: PATHS.RESET_PASSWORD,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: PATHS.VERIFY_EMAIL,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: PATHS.PROFILE,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: '/403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: PATHS.ADMIN,
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: PATHS.ADMIN_USERS, element: <AdminUsersPage /> },
      { path: PATHS.ADMIN_SETTINGS, element: <AdminSettingsPage /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

export { PATHS } from './paths'
