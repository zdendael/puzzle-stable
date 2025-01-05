import { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Trash2, MoreVertical } from 'lucide-react'
import { useActivityPanel } from '../../hooks/useActivityPanel'
import { formatDate, formatDateTime } from '../../utils/format'
import { useNavigate } from 'react-router-dom'
import { ItemActions } from '../ItemActions'
import type { Puzzle, WishListItem } from '../../lib/types'

export type ActivityType = 
  | { type: 'puzzle_added'; data: Puzzle }
  | { type: 'puzzle_removed'; data: Puzzle }
  | { type: 'puzzle_deleted'; data: Puzzle }
  | { type: 'wishlist_added'; data: WishListItem }
  | { type: 'wishlist_deleted'; data: WishListItem }
  | { type: 'wishlist_purchased'; data: Puzzle }

interface ActivityPanelProps {
  activities: ActivityType[]
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  const { isVisible, toggleVisibility, hidePanel } = useActivityPanel()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && 
          panelRef.current && 
          !panelRef.current.contains(event.target as Node) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node)) {
        hidePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisible, hidePanel])

  const handlePuzzleClick = (name: string, deleted?: boolean) => {
    if (!deleted) {
      navigate('/', { state: { searchTerm: name } })
      hidePanel()
    }
  }

  const getActivityIcon = (activity: ActivityType) => {
    const baseClasses = "w-6 h-6"
    
    switch (activity.type) {
      case 'puzzle_added':
        return <Plus className={`${baseClasses} text-green-500`} />
      case 'puzzle_removed':
        return <Minus className={`${baseClasses} text-red-500`} />
      case 'puzzle_deleted':
        return <Trash2 className={`${baseClasses} text-red-500`} />
      case 'wishlist_added':
        return <Plus className={`${baseClasses} text-purple-500`} />
      case 'wishlist_deleted':
        return <Minus className={`${baseClasses} text-purple-500`} />
      case 'wishlist_purchased':
        return <ShoppingCart className={`${baseClasses} text-green-500`} />
    }
  }

  const getPuzzleName = (name: string, deleted?: boolean) => (
    <button
      onClick={() => handlePuzzleClick(name, deleted)}
      className={`${
        deleted 
          ? 'text-gray-500 dark:text-gray-400 cursor-default' 
          : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
      }`}
    >
      {name}
    </button>
  )

  const getActivityText = (activity: ActivityType) => {
    switch (activity.type) {
      case 'puzzle_added':
        return <>Přidáno puzzle {getPuzzleName(activity.data.name, activity.data.deleted_at)}</>
      case 'puzzle_removed':
        return <>Odebráno ze sbírky {getPuzzleName(activity.data.name, activity.data.deleted_at)}</>
      case 'puzzle_deleted':
        return <>Smazáno puzzle "{activity.data.name}"</>
      case 'wishlist_added':
        return <>Přidáno do nákupního seznamu "{activity.data.name}"</>
      case 'wishlist_deleted':
        return <>Smazáno z nákupního seznamu "{activity.data.name}"</>
      case 'wishlist_purchased':
        return <>Nakoupeno z nákupního seznamu {getPuzzleName(activity.data.name, activity.data.deleted_at)}</>
    }
  }

  const getActivityTimestamp = (activity: ActivityType) => {
    switch (activity.type) {
      case 'puzzle_added':
      case 'wishlist_purchased':
        return formatDateTime(new Date(activity.data.created_at!))
      case 'puzzle_removed':
        return formatDate(activity.data.removal_date!)
      case 'puzzle_deleted':
        return formatDateTime(activity.data.deleted_at!)
      case 'wishlist_added':
      case 'wishlist_deleted':
        return formatDateTime(new Date(activity.data.created_at!))
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleVisibility}
        className="fixed top-20 right-0 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l-lg shadow-lg z-50 hover:bg-gray-50 dark:hover:bg-gray-700"
        title="Zobrazit panel aktivit"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      <div 
        ref={panelRef}
        className={`fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Poslední aktivity</h2>
          <button
            onClick={hidePanel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Skrýt panel aktivit"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {activities.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Zatím žádné aktivity
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity, index) => (
                <div 
                  key={`${activity.type}-${index}`} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    index > 0 && activities[index - 1].data.id === activity.data.id
                      ? 'bg-gray-50/50 dark:bg-gray-800/50'
                      : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="ml-3 flex-grow min-w-0">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getActivityText(activity)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getActivityTimestamp(activity)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ItemActions
                        onDelete={() => {
                          // TODO: Implementovat mazání aktivit
                        }}
                        hideEdit
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}