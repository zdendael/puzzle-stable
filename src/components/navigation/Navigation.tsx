import { Link, useLocation } from 'react-router-dom'
import { Puzzle, Grid3x3, Tags, Factory, Link as LinkIcon, Clock, ShoppingCart, BarChart, Menu, X, BookOpen } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useTheme } from '../../hooks/useTheme'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import { UserMenu } from './UserMenu'
import { ScrollToTop } from './ScrollToTop'
import type { NavLink } from './types'

export function Navigation() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { isDark, toggle } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Odhlášení proběhlo úspěšně')
    } catch (error) {
      toast.error('Při odhlašování došlo k chybě')
    }
  }

  const links: NavLink[] = [
    { to: '/', icon: Puzzle, label: 'Puzzle' },
    { to: '/sessions', icon: Clock, label: 'Skládání' },
    { to: '/wishlist', icon: ShoppingCart, label: 'Nákupní seznam' },
    { to: '/statistics', icon: BarChart, label: 'Statistiky' },
    { to: '/categories', icon: Grid3x3, label: 'Motivy' },
    { to: '/tags', icon: Tags, label: 'Štítky' },
    { to: '/manufacturers', icon: Factory, label: 'Výrobci' },
    { to: '/editions', icon: BookOpen, label: 'Edice' },
    { to: '/sources', icon: LinkIcon, label: 'Zdroje' }
  ]

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Puzzle kolekce Počmárané puzzlařky
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            {/* Desktop navigation */}
            {user ? (
              <>
                <DesktopNav links={links} currentPath={location.pathname} />
                <UserMenu 
                  isDark={isDark}
                  onThemeToggle={toggle}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <Link
                to="/wishlist"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/wishlist'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Nákupní seznam
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && (
          <MobileNav
            links={links}
            currentPath={location.pathname}
            isOpen={isMobileMenuOpen}
            isDark={isDark}
            onClose={() => setIsMobileMenuOpen(false)}
            onThemeToggle={toggle}
            onLogout={handleLogout}
          />
        )}
      </nav>

      <ScrollToTop />
    </>
  )
}