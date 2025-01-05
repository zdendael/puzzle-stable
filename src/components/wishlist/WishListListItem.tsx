import { ItemActions } from '../ItemActions'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { ShoppingCart, ExternalLink, UserCheck } from 'lucide-react'
import type { WishListItem } from '../../lib/types'
import { SourceUrl } from '../SourceUrl'
import { formatDate } from '../../utils/format'

interface WishListListItemProps {
  item: WishListItem
  onEdit?: (item: WishListItem) => void
  onDelete?: (id: number) => void
  onAddToPuzzles?: (item: WishListItem) => void
  onReserve?: (item: WishListItem) => void
  onCancelReservation?: (id: number) => void
  categories: any[]
  tags: any[]
  isAuthenticated: boolean
}

export function WishListListItem({
  item,
  onEdit,
  onDelete,
  onAddToPuzzles,
  onReserve,
  onCancelReservation,
  categories,
  tags,
  isAuthenticated
}: WishListListItemProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Vysoká priorita'
      case 'medium':
        return 'Střední priorita'
      case 'low':
        return 'Nízká priorita'
      default:
        return 'Neznámá priorita'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex gap-4">
        {/* Náhled obrázku */}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-600">
              <span className="text-sm">Bez obrázku</span>
            </div>
          )}
        </div>

        {/* Hlavní obsah */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.manufacturer} • {item.pieces} dílků • {item.price} Kč
                {item.created_at && (
                  <> • Přidáno {formatDate(item.created_at)}</>
                )}
                {item.source?.name && (
                  <> • {item.source.name}</>
                )}
                {item.url && (
                  <>
                    {' '}
                    <SourceUrl url={item.url} />
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => onAddToPuzzles?.(item)}
                    className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                    title="Přidat do sbírky"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <ItemActions
                    onEdit={() => onEdit?.(item)}
                    onDelete={() => onDelete?.(item.id!)}
                  />
                </>
              ) : (
                !item.reservation && (
                  <button
                    onClick={() => onReserve?.(item)}
                    className="btn btn-primary"
                  >
                    Rezervovat
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyle(item.priority)}`}>
              {getPriorityLabel(item.priority)}
            </span>
            {!item.in_stock && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Není skladem
              </span>
            )}
            {item.reservation && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                <UserCheck className="w-4 h-4" />
                <span>
                  Rezervováno ({item.reservation.reserver_name})
                  {isAuthenticated && (
                    <button
                      onClick={() => onCancelReservation?.(item.reservation!.id)}
                      className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      Zrušit
                    </button>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Kategorie */}
          {item.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.categories.map(categoryName => {
                const category = categories?.find(c => c.name === categoryName)
                return category ? (
                  <span
                    key={categoryName}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  >
                    <span className="text-base mr-1">{category.emoji}</span>
                    {category.name}
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* Štítky */}
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map(tagName => {
                const tag = tags?.find(t => t.name === tagName)
                return tag ? (
                  <span
                    key={tagName}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      ...(document.documentElement.classList.contains('dark') && {
                        backgroundColor: `${tag.color}40`,
                        color: `${tag.color}dd`
                      })
                    }}
                  >
                    <span className="text-base mr-1">{tag.emoji}</span>
                    {tag.name}
                  </span>
                ) : null
              })}
            </div>
          )}

          {item.notes && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {item.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}