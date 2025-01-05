import { Link } from 'react-router-dom'
import { Puzzle, Grid3x3, Tags, Factory, Link as LinkIcon, Clock, ShoppingCart, BarChart, BookOpen } from 'lucide-react'
import type { NavLink } from './types'

interface DesktopNavProps {
  links: NavLink[]
  currentPath: string
}

export function DesktopNav({ links, currentPath }: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {links.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            currentPath === to
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
          }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Link>
      ))}
    </div>
  )
}