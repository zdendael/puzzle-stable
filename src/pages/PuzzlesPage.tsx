import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPuzzles, deletePuzzle } from '../lib/api/puzzles'
import { getTags } from '../lib/api/tags'
import { getCategories } from '../lib/api/categories'
import { getManufacturers } from '../lib/api/manufacturers'
import { getSources } from '../lib/api/sources'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { PuzzleForm } from '../components/PuzzleForm'
import { PuzzleCard } from '../components/puzzle/PuzzleCard'
import { FilterSidebar } from '../components/filters/FilterSidebar'
import { SearchBar } from '../components/filters/SearchBar'
import { ArrowUpDown, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Puzzle } from '../lib/types'
import { useLocation } from 'react-router-dom'
import { initialFilters } from '../lib/constants/filters'
import type { Filters } from '../lib/types/filters'

export type CollectionFilter = 'all' | 'in_collection' | 'removed'

const ITEMS_PER_PAGE = 20

export function PuzzlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortAscending, setSortAscending] = useState(false)
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE)
  const [filters, setFilters] = useState<Filters>(initialFilters)

  const location = useLocation()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm)
    }
    if (location.state?.edition) {
      setFilters(prev => ({
        ...prev,
        editions: [location.state.edition]
      }))
    }
    if (location.state?.isCollaboration) {
      setFilters(prev => ({
        ...prev,
        sources: location.state.sources || []
      }))
    }
    // Vyčistit state po aplikování filtrů
    window.history.replaceState({}, document.title)
  }, [location.state])

  const { data: puzzles = [], isLoading, error } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 1000 * 60 * 5
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5
  })

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers
  })

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
    staleTime: 1000 * 60 * 5
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deletePuzzle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success('Puzzle bylo smazáno')
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleEdit = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedPuzzle(undefined)
    setIsModalOpen(true)
  }

  const handleFilter = (type: string, value: string | boolean | CollectionFilter) => {
    switch (type) {
      case 'acquisition':
        const isGift = value === 'gift'
        const isCollaboration = value === 'collaboration'
        const isOwnPurchase = value === 'own_purchase'
        setFilters({ 
          ...filters, 
          isGift,
          isCollaboration,
          isOwnPurchase,
          // Reset ostatních filtrů způsobu získání
          ...(isGift ? { isCollaboration: false, isOwnPurchase: false } :
              isCollaboration ? { isGift: false, isOwnPurchase: false } :
              isOwnPurchase ? { isGift: false, isCollaboration: false } : {})
        })
        break;
      case 'rating':
        const rating = parseInt(value as string)
        setFilters({ 
          ...filters, 
          ratingRange: { min: rating, max: rating }
        })
        break
      case 'manufacturer':
        setFilters({ ...filters, manufacturers: [value as string] })
        break
      case 'pieces':
        setFilters({ ...filters, pieces: [parseInt(value as string)] })
        break
      case 'difficulty':
        setFilters({ ...filters, difficulties: [value as string] })
        break
      case 'category':
        setFilters({ ...filters, categories: [value as string] })
        break
      case 'tag':
        setFilters({ ...filters, tags: [value as string] })
        break
      case 'source':
        setFilters({ ...filters, sources: [parseInt(value as string)] })
        break
      case 'edition':
        setFilters({ ...filters, editions: [parseInt(value as string)] })
        break
      case 'collection':
        setFilters({ ...filters, collectionStatus: value as CollectionFilter })
        break
      case 'estimatedTime':
        const minutes = parseInt(value as string)
        setFilters({ 
          ...filters, 
          estimatedTimeRange: { min: minutes, max: minutes }
        })
        break
    }
  }

  const filteredPuzzles = puzzles.filter(puzzle => {
    if (searchTerm && !puzzle.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    if (filters.pieces.length > 0 && !filters.pieces.includes(puzzle.pieces)) return false
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(puzzle.difficulty)) return false
    if (filters.ratingRange.min !== null && (!puzzle.rating || puzzle.rating < filters.ratingRange.min)) return false
    if (filters.ratingRange.max !== null && (!puzzle.rating || puzzle.rating > filters.ratingRange.max)) return false
    
    if (filters.collectionStatus === 'in_collection' && !puzzle.in_collection) return false
    if (filters.collectionStatus === 'removed' && puzzle.in_collection) return false

    if (filters.isGift && !puzzle.is_gift) return false
    if (filters.isCollaboration && !puzzle.is_collaboration) return false
    if (filters.isOwnPurchase && !puzzle.is_own_purchase) return false

    if (filters.priceMin && puzzle.price < filters.priceMin) return false
    if (filters.priceMax && puzzle.price > filters.priceMax) return false

    if (filters.sessionDuration.min || filters.sessionDuration.max) {
      const hasSuitableSession = puzzle.sessions?.some(session => {
        if (!session.duration_minutes) return false
        if (filters.sessionDuration.min && session.duration_minutes < filters.sessionDuration.min) return false
        if (filters.sessionDuration.max && session.duration_minutes > filters.sessionDuration.max) return false
        return true
      })
      if (!hasSuitableSession) return false
    }

    if (filters.sources.length > 0 && (!puzzle.source || !filters.sources.includes(puzzle.source.id))) return false
    if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(puzzle.manufacturer)) return false
    if (filters.categories.length > 0 && !filters.categories.some(cat => puzzle.categories.includes(cat))) return false
    if (filters.tags.length > 0 && !filters.tags.some(tag => puzzle.tags.includes(tag))) return false
    if (filters.editions.length > 0 && !filters.editions.includes(puzzle.edition_id || 0)) return false

    if (filters.dateRange.from && new Date(puzzle.acquisition_date) < new Date(filters.dateRange.from)) return false
    if (filters.dateRange.to && new Date(puzzle.acquisition_date) > new Date(filters.dateRange.to)) return false

    if (filters.purchaseDateRange.from && (!puzzle.purchase_date || new Date(puzzle.purchase_date) < new Date(filters.purchaseDateRange.from))) return false
    if (filters.purchaseDateRange.to && (!puzzle.purchase_date || new Date(puzzle.purchase_date) > new Date(filters.purchaseDateRange.to))) return false

    // Filtr pro předpokládanou dobu skládání
    if (filters.estimatedTimeRange.min !== null || filters.estimatedTimeRange.max !== null) {
      // Pokud má puzzle již nějaké skládání, nezahrneme ho do filtru
      if (puzzle.sessions?.length) return false

      // Najdeme podobná puzzle (±500 dílků) s dokončeným skládáním
      const similarPuzzles = puzzles.filter(p => {
        const pieceDifference = Math.abs(p.pieces - puzzle.pieces)
        return pieceDifference <= 500 && p.sessions?.some(s => s.duration_minutes)
      })

      if (!similarPuzzles.length) return false

      // Vypočítáme průměrnou rychlost skládání
      const completionTimes = similarPuzzles.flatMap(p => 
        p.sessions?.filter(s => s.duration_minutes).map(s => ({
          piecesPerMinute: p.pieces / s.duration_minutes!
        })) || []
      )

      if (!completionTimes.length) return false

      const avgPiecesPerMinute = completionTimes.reduce((sum, time) => 
        sum + time.piecesPerMinute, 0) / completionTimes.length

      const estimatedMinutes = Math.round(puzzle.pieces / avgPiecesPerMinute)

      if (filters.estimatedTimeRange.min !== null && estimatedMinutes < filters.estimatedTimeRange.min) return false
      if (filters.estimatedTimeRange.max !== null && estimatedMinutes > filters.estimatedTimeRange.max) return false
    }

    return true
  }).sort((a, b) => {
    const comparison = new Date(b.acquisition_date).getTime() - new Date(a.acquisition_date).getTime()
    return sortAscending ? -comparison : comparison
  })

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE)
  }

  const visiblePuzzles = filteredPuzzles.slice(0, visibleItems)
  const hasMore = visibleItems < filteredPuzzles.length

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst puzzle" />

  return (
    <div className="flex">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        manufacturers={manufacturers}
        categories={categories}
        tags={tags}
        sources={sources}
      />

      <div className="flex-1 px-6">
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Puzzle</h1>
            <button onClick={handleAdd} className="btn btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-1" />
              Puzzle
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              title={sortAscending ? "Seřadit od nejnovějšího" : "Seřadit od nejstaršího"}
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAscending ? "Od nejstaršího" : "Od nejnovějšího"}
            </button>
          </div>
        </div>

        {filteredPuzzles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Žádná puzzle nebyla nalezena.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-6">
              {visiblePuzzles.map((puzzle) => (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onFilter={handleFilter}
                  categories={categories}
                  tags={tags}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8 mb-8">
                <button
                  onClick={handleLoadMore}
                  className="btn btn-secondary"
                >
                  Načíst další
                </button>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedPuzzle ? 'Upravit puzzle' : 'Nové puzzle'}
          size="large"
        >
          <PuzzleForm
            puzzle={selectedPuzzle}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  )
}