import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 flex-grow mt-16 max-w-[1920px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}