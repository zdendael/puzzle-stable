import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../lib/api/puzzles'
import { getWishList } from '../lib/api/wishlist'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Package, ShoppingCart, Trash2, Plus, Minus, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatShortDuration } from '../utils/format'

const ITEMS_PER_PAGE = 20

export function ActivityLogPage() {
  const navigate = useNavigate()
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE)
  
  const { data: puzzles = [], isLoading: isPuzzlesLoading } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  const { data: wishlist = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishList
  })

  if (isPuzzlesLoading || isWishlistLoading) return <LoadingSpinner />

  // Vytvoření seznamu všech aktivit
  const activities = [
    // Dokončená skládání
    ...puzzles.flatMap(puzzle => 
      (puzzle.sessions || [])
        .filter(session => session.duration_minutes)
        .map(session => ({
          type: 'session_completed',
          data: { puzzle, session },
          timestamp: new Date(session.end_date || session.start_date).getTime(),
          icon: <Clock className="w-5 h-5 text-indigo-500" />,
          message: {
            prefix: 'Složeno puzzle ',
            name: puzzle.name,
            suffix: ` za ${formatShortDuration(session.duration_minutes)}`
          },
          onClick: () => navigate('/', { state: { searchTerm: puzzle.name } })
        }))
    ),

    // Přidaná puzzle
    ...puzzles.map(puzzle => ({
      type: 'puzzle_added',
      data: puzzle,
      timestamp: new Date(puzzle.created_at!).getTime(),
      icon: <Plus className="w-5 h-5 text-green-500" />,
      message: {
        prefix: 'Přidáno puzzle ',
        name: puzzle.name,
        suffix: ''
      },
      onClick: () => navigate('/', { state: { searchTerm: puzzle.name } })
    })),

    // Odebraná puzzle ze sbírky
    ...puzzles
      .filter(p => !p.in_collection && p.removal_date)
      .map(puzzle => ({
        type: 'puzzle_removed',
        data: puzzle,
        timestamp: new Date(puzzle.removal_date!).getTime(),
        icon: <Minus className="w-5 h-5 text-red-500" />,
        message: {
          prefix: 'Odebráno ze sbírky ',
          name: puzzle.name,
          suffix: ''
        },
        onClick: () => navigate('/', { state: { searchTerm: puzzle.name } })
      })),

    // Smazaná puzzle
    ...puzzles
      .filter(p => p.deleted_at)
      .map(puzzle => ({
        type: 'puzzle_deleted',
        data: puzzle,
        timestamp: new Date(puzzle.deleted_at!).getTime(),
        icon: <Trash2 className="w-5 h-5 text-red-500" />,
        message: {
          prefix: 'Smazáno puzzle ',
          name: puzzle.name,
          suffix: ''
        }
      })),

    // Nakoupená puzzle z wishlistu
    ...puzzles
      .filter(p => p.from_wishlist)
      .map(puzzle => ({
        type: 'wishlist_purchased',
        data: puzzle,
        timestamp: new Date(puzzle.created_at!).getTime(),
        icon: <Package className="w-5 h-5 text-green-500" />,
        message: {
          prefix: 'Nakoupeno z nákupního seznamu ',
          name: puzzle.name,
          suffix: ''
        },
        onClick: () => navigate('/', { state: { searchTerm: puzzle.name } })
      })),

    // Přidané položky do wishlistu
    ...wishlist
      .filter(item => !item.deleted_at)
      .map(item => ({
        type: 'wishlist_added',
        data: item,
        timestamp: new Date(item.created_at!).getTime(),
        icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
        message: {
          prefix: 'Přidáno do nákupního seznamu ',
          name: item.name,
          suffix: ''
        },
        onClick: () => navigate('/wishlist', { state: { searchTerm: item.name } })
      })),

    // Smazané položky z wishlistu
    ...wishlist
      .filter(item => item.deleted_at)
      .map(item => ({
        type: 'wishlist_deleted',
        data: item,
        timestamp: new Date(item.deleted_at!).getTime(),
        icon: <Trash2 className="w-5 h-5 text-purple-500" />,
        message: {
          prefix: 'Smazáno z nákupního seznamu ',
          name: item.name,
          suffix: ''
        }
      }))
  ].sort((a, b) => b.timestamp - a.timestamp)

  const visibleActivities = activities.slice(0, visibleItems)
  const hasMore = visibleItems < activities.length

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE)
  }

  if (!activities.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Zatím žádné aktivity.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Historie aktivit</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {visibleActivities.map((activity, index) => (
            <div 
              key={`${activity.type}-${index}`}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message.prefix}
                    {activity.onClick ? (
                      <button
                        onClick={activity.onClick}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        {activity.message.name}
                      </button>
                    ) : (
                      <span>{activity.message.name}</span>
                    )}
                    {activity.message.suffix}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format(activity.timestamp, 'PPp', { locale: cs })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="btn btn-secondary"
          >
            Načíst další
          </button>
        </div>
      )}
    </div>
  )
}