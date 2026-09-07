import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header } from './Header'
import { Footer } from './Footer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function MainLayout() {
  const { pathname } = useLocation()
  const isTreePage = pathname === '/' || pathname === '/tree' || pathname === '/family-tree'

  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text)] transition-colors duration-250">
      <ScrollToTop />
      <Header />
      <main className={isTreePage ? 'flex-1 w-full flex flex-col p-0 m-0 overflow-hidden h-[calc(100vh-64px)]' : 'flex-1 w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6'}>
        <Suspense
          fallback={
            <div className="py-12 space-y-4 max-w-4xl mx-auto">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-48 w-full mt-6" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      {!isTreePage && <Footer />}
    </div>
  )
}
