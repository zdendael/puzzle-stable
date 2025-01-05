import { Link } from 'react-router-dom'
import { Sun, Moon, Download, LogOut } from 'lucide-react'
import { ExportButton } from '../ExportButton'
import type { NavLink } from './types'

interface MobileNavProps {
  links: NavLink[]
  currentPath: string
  isOpen: boolean
  isDark: boolean
  onClose: () => void
  onThemeToggle: () => void
  onLogout: () => void
}

export function MobileNav({ 
  links, 
  currentPath, 
  isOpen, 
  isDark,
  onClose,
  onThemeToggle,
  onLogout
}: MobileNavProps) {
  if (!isOpen) return null

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              currentPath === to
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
            }`}
            onClick={onClose}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </div>
          </Link>
        ))}

        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
          <button
            onClick={() => {
              onThemeToggle()
              onClose()
            }}
            className="block w-full px-3 py-2 text-left text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center">
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Světlý režim' : 'Tmavý režim'}
            </div>
          </button>

          <button
            onClick={onClose}
            className="block w-full px-3 py-2 text-left text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3" />
              <ExportButton />
            </div>
          </button>

          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="block w-full px-3 py-2 text-left text-base font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center">
              <LogOut className="w-5 h-5 mr-3" />
              Odhlásit se
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}