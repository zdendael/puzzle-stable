import { BarChart, ChevronLeft, ChevronRight, Clock, Star, DollarSign, Globe, ShoppingCart, Handshake } from 'lucide-react'
import { useState } from 'react'

interface StatisticsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function StatisticsSidebar({ activeSection, onSectionChange }: StatisticsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const sections = [
    { id: 'overview', name: 'Přehled sbírky', icon: BarChart },
    { id: 'manufacturers', name: 'Mapa zemí výrobců', icon: Globe },
    { id: 'collaborations', name: 'Spolupráce', icon: Handshake },
    { id: 'wishlist', name: 'Nákupní seznam', icon: ShoppingCart },
    { id: 'sessions', name: 'Skládání', icon: Clock },
    { id: 'ratings', name: 'Hodnocení', icon: Star },
    { id: 'financial', name: 'Finance', icon: DollarSign }
  ]

  return (
    <div
      className={`bg-indigo-50 dark:bg-indigo-900/10 border-r border-indigo-100 dark:border-indigo-900/20 h-[calc(100vh-64px)] sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-64'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm"
        title={isCollapsed ? 'Zobrazit menu' : 'Skrýt menu'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {!isCollapsed && (
        <div className="p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === section.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {section.name}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}