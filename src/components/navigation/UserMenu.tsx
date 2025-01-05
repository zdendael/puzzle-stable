import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Download, LogOut, MoreVertical, History } from 'lucide-react'
import { ExportButton } from '../ExportButton'
import { useNavigate } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'

interface UserMenuProps {
  isDark: boolean
  onThemeToggle: () => void
  onLogout: () => void
}

export function UserMenu({ isDark, onThemeToggle, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Další možnosti"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onThemeToggle()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDark ? 'Světlý režim' : 'Tmavý režim'}
              </button>
              
              <button
                onClick={() => {
                  navigate('/activity-log')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <History className="w-4 h-4 mr-2" />
                Historie aktivit
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                <ExportButton />
              </button>

              <button
                onClick={() => {
                  onLogout()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Odhlásit se
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}