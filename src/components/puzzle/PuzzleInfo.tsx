import { Store, Globe, User, Building2, Factory, Hash, BarChart3, Calendar, DollarSign, Bar, BookOpen, Link, Star, Youtube } from 'lucide-react'
import { SourceUrl } from '../SourceUrl'
import { StarRating } from '../StarRating'
import { EstimatedTime } from './EstimatedTime'
import type { Puzzle } from '../../lib/types'
import { formatDate } from '../../utils/format'
import type { CollectionFilter } from '../../pages/PuzzlesPage'
import { COUNTRIES } from '../../lib/countries'
import { useQuery } from '@tanstack/react-query'
import { getManufacturers, getPuzzles } from '../../lib/api'

interface PuzzleInfoProps {
  puzzle: Puzzle
  onFilter: (type: string, value: string | CollectionFilter) => void
}

export function PuzzleInfo({ puzzle, onFilter }: PuzzleInfoProps) {
  const { data: manufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers
  })

  const { data: allPuzzles = [] } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

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

  const getCountryFlag = (manufacturerName: string) => {
    const manufacturer = manufacturers?.find(m => m.name === manufacturerName)
    if (manufacturer?.countryCode) {
      const country = COUNTRIES.find(c => c.code === manufacturer.countryCode)
      return country?.flag || ''
    }
    return ''
  }

  return (
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
                onClick={() => onFilter('manufacturer', puzzle.manufacturer)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2"
              >
                <span className="text-lg">{getCountryFlag(puzzle.manufacturer)}</span>
                {puzzle.manufacturer}
              </button>
            </td>
          </tr>
          {puzzle.edition && puzzle.edition_id && (
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-400">
                <BookOpen className="inline w-4 h-4 mr-1" />
                Edice:
              </td>
              <td>
                <button
                  onClick={() => onFilter('edition', puzzle.edition_id.toString())}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  {puzzle.edition}
                </button>
              </td>
            </tr>
          )}
          <tr>
            <td className="py-1 text-gray-600 dark:text-gray-400">
              <Hash className="inline w-4 h-4 mr-1" />
              Počet dílků:
            </td>
            <td>
              <button
                onClick={() => onFilter('pieces', puzzle.pieces.toString())}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {puzzle.pieces}
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-1 text-gray-600 dark:text-gray-400">
              <BarChart3 className="inline w-4 h-4 mr-1" />
              Obtížnost:
            </td>
            <td>
              <button
                onClick={() => onFilter('difficulty', puzzle.difficulty)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {puzzle.difficulty === 'unrated' ? 'Nehodnoceno' :
                 puzzle.difficulty === 'easy' ? 'Snadné' :
                 puzzle.difficulty === 'medium' ? 'Střední' : 'Těžké'}
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-1 text-gray-600 dark:text-gray-400">
              <Star className="inline w-4 h-4 mr-1" />
              Hodnocení:
            </td>
            <td className="text-gray-900 dark:text-gray-100">
              {puzzle.rating ? (
                <button
                  onClick={() => onFilter('rating', puzzle.rating.toString())}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <StarRating rating={puzzle.rating} readonly size="sm" />
                </button>
              ) : (
                'Nehodnoceno'
              )}
            </td>
          </tr>
          {puzzle.youtube_url && (
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-400">
                <Youtube className="inline w-4 h-4 mr-1" />
                Video:
              </td>
              <td>
                <a
                  href={puzzle.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Otevřít na YouTube
                </a>
              </td>
            </tr>
          )}
          {!puzzle.sessions?.length && (
            <EstimatedTime
              puzzle={puzzle}
              allPuzzles={allPuzzles}
              onFilter={onFilter}
            />
          )}
          {puzzle.source && (
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-400">
                <Link className="inline w-4 h-4 mr-1" />
                Zdroj:
              </td>
              <td className="flex items-center gap-2">
                <button
                  onClick={() => onFilter('source', puzzle.source!.id.toString())}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  {getSourceIcon(puzzle.source.type)}
                  {puzzle.source.name}
                </button>
                {puzzle.source.url && <SourceUrl url={puzzle.source.url} />}
              </td>
            </tr>
          )}
          {puzzle.is_collaboration && puzzle.published_at && (
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-400">
                <Calendar className="inline w-4 h-4 mr-1" />
                Publikováno:
              </td>
              <td className="text-gray-900 dark:text-gray-100">
                {formatDate(puzzle.published_at)}
              </td>
            </tr>
          )}
          {puzzle.is_own_purchase && (
            <>
              <tr>
                <td className="py-1 text-gray-600 dark:text-gray-400">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Cena:
                </td>
                <td className="text-gray-900 dark:text-gray-100">{puzzle.price} Kč</td>
              </tr>
              {puzzle.purchase_date && (
                <tr>
                  <td className="py-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Datum nákupu:
                  </td>
                  <td className="text-gray-900 dark:text-gray-100">{formatDate(puzzle.purchase_date)}</td>
                </tr>
              )}
            </>
          )}
          <tr>
            <td className="py-1 text-gray-600 dark:text-gray-400">
              <Calendar className="inline w-4 h-4 mr-1" />
              Datum přidání:
            </td>
            <td className="text-gray-900 dark:text-gray-100">{formatDate(puzzle.acquisition_date)}</td>
          </tr>
          {!puzzle.in_collection && puzzle.removal_date && (
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-400">
                <Calendar className="inline w-4 h-4 mr-1" />
                Datum vyřazení:
              </td>
              <td className="text-gray-900 dark:text-gray-100">{formatDate(puzzle.removal_date)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}