import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWishList, deleteWishListItem } from '../lib/api/wishlist'
import { getManufacturers } from '../lib/api/manufacturers'
import { getTags } from '../lib/api/tags'
import { getCategories } from '../lib/api/categories'
import { getSources } from '../lib/api/sources'
import { getSettings } from '../lib/api/settings'
import { createReservation, deleteReservation } from '../lib/api/reservations'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { WishListForm } from '../components/wishlist/WishListForm'
import { WishListCard } from '../components/wishlist/WishListCard'
import { WishListListItem } from '../components/wishlist/WishListListItem'
import { WishListSidebar } from '../components/wishlist/WishListSidebar'
import { SearchBar } from '../components/filters/SearchBar'
import { ReservationForm } from '../components/wishlist/ReservationForm'
import { Plus, ArrowUpDown, LayoutGrid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import type { WishListItem } from '../lib/types'
import { PuzzleForm } from '../components/PuzzleForm'
import { useAuth } from '../lib/auth'
import { useWishListFilters } from '../hooks/useWishListFilters'
import { applyWishListFilters } from '../lib/filters/wishlistFilters'
import { LoadingIndicator } from '../components/LoadingIndicator'

const ITEMS_PER_PAGE = 20

export function WishListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WishListItem | undefined>()
  const [itemToConvert, setItemToConvert] = useState<WishListItem | undefined>()
  const [itemToReserve, setItemToReserve] = useState<WishListItem | undefined>()
  const [sortAscending, setSortAscending] = useState(false)
  const [isGridLayout, setIsGridLayout] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const { filters, setFilters } = useWishListFilters()
  const initialFilters = {
    manufacturers: [] as string[],
    categories: [] as string[],
    tags: [] as string[],
    sources: [] as number[],
    priority: [] as string[],
    inStock: null as boolean | null,
    priceRange: { min: null as number | null, max: null as number | null }
  }
  
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()
  const locationState = location.state as { 
    priority?: string
    manufacturers?: string[]
    categories?: string[]
    source?: number,
    priceMin?: number,
    priceMax?: number,
    isReserved?: boolean,
    inStock?: boolean
  } | undefined

  useEffect(() => {
    if (locationState) {
      const newFilters = { ...initialFilters }
      
      if (locationState.priority) {
        newFilters.priority = [locationState.priority.toLowerCase()]
      }
      if (locationState.manufacturers) {
        newFilters.manufacturers = locationState.manufacturers
      }
      if (locationState.categories) {
        newFilters.categories = locationState.categories
      }
      if (locationState.source) {
        newFilters.sources = [locationState.source]
      }
      if (locationState.isReserved !== undefined) {
        newFilters.isReserved = locationState.isReserved
      }
      if (locationState.inStock !== undefined) {
        newFilters.inStock = locationState.inStock
      }
      if (locationState.priceMin !== undefined || locationState.priceMax !== undefined) {
        newFilters.priceRange = {
          min: locationState.priceMin || null,
          max: locationState.priceMax || null
        }
      }
      
      setFilters(newFilters)
      setSearchTerm('')
      // Vyčistit state po aplikování filtrů
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    // Vyčistit location state při změně filtrů
    if (JSON.stringify(newFilters) === JSON.stringify(initialFilters)) {
      window.history.replaceState({}, document.title)
    }
  }

  const { data: items = [], isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishList
  })

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  })

  const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers })
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: getSources })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteWishListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Položka byla smazána')
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const { mutate: handleReserve } = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      await createReservation(id, name)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Položka byla úspěšně rezervována')
      setIsReservationModalOpen(false)
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const { mutate: handleCancelReservation } = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Rezervace byla zrušena')
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleEdit = (item: WishListItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedItem(undefined)
    setIsModalOpen(true)
  }

  const handleAddToPuzzles = (item: WishListItem) => {
    setItemToConvert(item)
    setIsPuzzleModalOpen(true)
  }

  const handleReserveClick = (item: WishListItem) => {
    setItemToReserve(item)
    setIsReservationModalOpen(true)
  }

  const handlePuzzleSuccess = async () => {
    if (itemToConvert) {
      try {
        await deleteWishListItem(itemToConvert.id!)
        queryClient.invalidateQueries({ queryKey: ['wishlist'] })
        toast.success('Položka byla úspěšně převedena do sbírky')
      } catch (error) {
        console.error('Chyba při mazání položky z wishlistu:', error)
      }
    }
  }

  const handleFilter = (type: string, value: string) => {
    switch (type) {
      case 'manufacturer':
        setFilters({ ...filters, manufacturers: [value] })
        break
      case 'pieces':
        setFilters({ ...filters, pieces: [parseInt(value)] })
        break
      case 'priority':
        setFilters({ ...filters, priority: [value] })
        break
      case 'category':
        setFilters({ ...filters, categories: [value] })
        break
      case 'tag':
        setFilters({ ...filters, tags: [value] })
        break
      case 'source':
        setFilters({ ...filters, sources: [parseInt(value)] })
        break
    }
  }

  // Aplikace filtrů pomocí centrální funkce
  const filteredItems = applyWishListFilters(
    items.filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())),
    filters
  ).sort((a, b) => {
    const comparison = new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    return sortAscending ? -comparison : comparison
  })

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  const displayedItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < filteredItems.length

  // Pokud není wishlist veřejný a uživatel není přihlášený, zobrazíme zprávu
  if (!user && !settings?.public_wishlist) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Nákupní seznam není momentálně k dispozici
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vlastník seznamu jej momentálně nezveřejnil.
          </p>
        </div>
      </div>
    )
  }

  if (isItemsLoading) return <LoadingSpinner />
  if (itemsError) return <ErrorMessage message="Nepodařilo se načíst položky" />

  return (
    <div className="flex">
      {user && (
        <WishListSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          manufacturers={manufacturers || []}
          categories={categories || []}
          tags={tags || []}
          sources={sources || []}
          items={items}
        />
      )}

      <div className="flex-1 px-6">
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nákupní seznam</h1>
            {user && (
              <button onClick={handleAdd} className="btn btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-1" />
                Puzzle
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsGridLayout(true)}
                    className={`p-2 rounded-md ${
                      isGridLayout
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Zobrazit jako dlaždice"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsGridLayout(false)}
                    className={`p-2 rounded-md ${
                      !isGridLayout
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Zobrazit jako seznam"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setSortAscending(!sortAscending)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  title={sortAscending ? "Seřadit od nejnovějšího" : "Seřadit od nejstaršího"}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortAscending ? "Od nejstaršího" : "Od nejnovějšího"}
                </button>
              </>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Zatím žádné položky v nákupním seznamu.</p>
          </div>
        ) : isGridLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedItems.map((item) => (
              <WishListCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddToPuzzles={handleAddToPuzzles}
                onReserve={handleReserveClick}
                onCancelReservation={handleCancelReservation}
                onFilter={handleFilter}
                categories={categories || []}
                tags={tags || []}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedItems.map((item) => (
              <WishListListItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddToPuzzles={handleAddToPuzzles}
                onReserve={handleReserveClick}
                onCancelReservation={handleCancelReservation}
                onFilter={handleFilter}
                categories={categories || []}
                tags={tags || []}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}

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

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem ? 'Upravit položku' : 'Nová položka'}
          size="large"
        >
          <WishListForm
            item={selectedItem}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isPuzzleModalOpen}
          onClose={() => setIsPuzzleModalOpen(false)}
          title="Přidat do sbírky"
          size="large"
        >
          <PuzzleForm
            initialData={{
              name: itemToConvert?.name,
              manufacturer: itemToConvert?.manufacturer,
              pieces: itemToConvert?.pieces,
              categories: itemToConvert?.categories,
              image_url: itemToConvert?.image_url,
              price: itemToConvert?.price,
              source: itemToConvert?.source,
              notes: itemToConvert?.notes,
              tags: itemToConvert?.tags,
              is_own_purchase: true,
              purchase_date: new Date()
            }}
            onClose={() => setIsPuzzleModalOpen(false)}
            onSuccess={handlePuzzleSuccess}
          />
        </Modal>

        <Modal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          title="Rezervace puzzle"
        >
          <ReservationForm
            item={itemToReserve!}
            onSubmit={(name) => handleReserve({ id: itemToReserve!.id!, name })}
            onClose={() => setIsReservationModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  )
}