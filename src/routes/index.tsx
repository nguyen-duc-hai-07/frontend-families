import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { PATHS } from './paths'

// Lazy load Pages
const FamilyTreePage = lazy(() => import('@/features/family-tree/pages/FamilyTreePage'))
const PersonsPage = lazy(() => import('@/pages/PersonsPage'))
const PersonDetailPage = lazy(() => import('@/pages/PersonDetailPage'))
const RelationsPage = lazy(() => import('@/pages/RelationsPage'))
const FamilyInfoPage = lazy(() => import('@/pages/FamilyInfoPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: PATHS.HOME, element: <FamilyTreePage /> },
      { path: PATHS.FAMILY_TREE, element: <FamilyTreePage /> },
      { path: PATHS.PERSONS, element: <PersonsPage /> },
      { path: PATHS.PERSON_DETAIL, element: <PersonDetailPage /> },
      { path: PATHS.RELATIONS, element: <RelationsPage /> },
      { path: PATHS.FAMILY_INFO, element: <FamilyInfoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

export { PATHS } from './paths'
