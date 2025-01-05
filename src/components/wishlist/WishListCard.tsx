import { ItemActions } from '../ItemActions'
import { ShoppingCart, Link, UserCheck, Store, Globe, User, Building2, Hash, Calendar, DollarSign, Factory } from 'lucide-react'
import type { WishListItem } from '../../lib/types'
import { SourceUrl } from '../SourceUrl'
import { formatDate } from '../../utils/format'
import { COUNTRIES } from '../../lib/countries'
import { useQuery } from '@tanstack/react-query'
import { getManufacturers } from '../../lib/api/manufacturers'

interface WishListCardProps {
  item: WishListItem
  onEdit?: (item: WishListItem) => void
  onDelete?: (id: number) => void
  onAddToPuzzles?: (item: WishListItem) => void
  onReserve?: (item: WishListItem) => void
  onCancelReservation?: (id: number) => void
  onFilter: (type: string, value: string) => void
  categories: any[]
  tags: any[]
  isAuthenticated: boolean
}

export function WishListCard({
  item,
  onEdit,
  onDelete,
  onAddToPuzzles,
  onReserve,
  onCancelReservation,
  onFilter,
  categories,
  tags,
  isAuthenticated
}: WishListCardProps) {
  const { data: manufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers
  })

  const getCountryFlag = (manufacturerName: string) => {
    const manufacturer = manufacturers?.find(m => m.name === manufacturerName)
    if (manufacturer?.countryCode) {
      const country = COUNTRIES.find(c => c.code === manufacturer.countryCode)
      return country?.flag || ''
    }
    return ''
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'eshop':
        return <Globe className="inline w-4 h-4 mr-1 text-blue-500" />
      case 'store':
        return <Store className="inline w-4 h-4 mr-1 text-green-500" />
      case 'person':
        return <User className="inline w-4 h-4 mr-1 text-purple-500" />
      case 'company':
        return <Building2 className="inline w-4 h-4 mr-1 text-orange-500" />
      default:
        return null
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/70'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/70'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.name}</h3>
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

        {/* Obrázek */}
        <div className="w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="max-w-full max-h-64 object-contain"
            />
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-600">
              <span className="text-sm">Bez obrázku</span>
            </div>
          )}
        </div>

        {/* Priority a skladem */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => onFilter('priority', item.priority)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyle(item.priority)}`}
          >
            {getPriorityLabel(item.priority)}
          </button>
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

        {/* Základní informace */}
        <div className="mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600 dark:text-gray-400">
                  <Factory className="inline w-4 h-4 mr-1" />
                  Výrobce:
                </td>
                <td>
                  <button
                    onClick={() => onFilter('manufacturer', item.manufacturer)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2"
                  >
                    <span className="text-lg">{getCountryFlag(item.manufacturer)}</span>
                    {item.manufacturer}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600 dark:text-gray-400">
                  <Hash className="inline w-4 h-4 mr-1" />
                  Počet dílků:
                </td>
                <td>
                  <button
                    onClick={() => onFilter('pieces', item.pieces.toString())}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    {item.pieces}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600 dark:text-gray-400">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Cena:
                </td>
                <td className="text-gray-900 dark:text-gray-100">{item.price} Kč</td>
              </tr>
              {item.source && (
                <tr>
                  <td className="py-1 text-gray-600 dark:text-gray-400">
                    <Link className="inline w-4 h-4 mr-1" />
                    Zdroj:
                  </td>
                  <td className="flex items-center gap-2">
                    <button
                      onClick={() => onFilter('source', item.source!.id.toString())}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                      {getSourceIcon(item.source.type)}
                      {item.source.name}
                    </button>
                    {item.url && <SourceUrl url={item.url} />}
                  </td>
                </tr>
              )}
              {item.created_at && (
                <tr>
                  <td className="py-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Datum přidání:
                  </td>
                  <td className="text-gray-900 dark:text-gray-100">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Motivy a štítky vedle sebe */}
        <div className="grid grid-cols-2 gap-4">
          {/* Kategorie */}
          {item.categories.length > 0 && (
            <div>
              <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Motivy:</div>
              <div className="flex flex-col gap-2">
                {item.categories.map(categoryName => {
                  const category = categories?.find(c => c.name === categoryName)
                  return category ? (
                    <button
                      key={categoryName}
                      onClick={() => onFilter('category', categoryName)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/70"
                    >
                      <span className="text-base mr-1">{category.emoji}</span>
                      {category.name}
                    </button>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Štítky */}
          {item.tags.length > 0 && (
            <div>
              <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Štítky:</div>
              <div className="flex flex-col gap-2">
                {item.tags.map(tagName => {
                  const tag = tags?.find(t => t.name === tagName)
                  return tag ? (
                    <button
                      key={tagName}
                      onClick={() => onFilter('tag', tagName)}
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
                    </button>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        {/* Poznámky */}
        {item.notes && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {item.notes}
          </div>
        )}
      </div>
    </div>
  )
}