import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, deleteCategory } from '../lib/api/categories'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { CategoryForm } from '../components/CategoryForm'
import { ItemActions } from '../components/ItemActions'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { SearchBar } from '../components/filters/SearchBar'
import { useLayoutPreference } from '../hooks/useLayoutPreference'
import { useTableSort } from '../hooks/useTableSort'
import { sortData } from '../utils/sorting'
import { SortableHeader } from '../components/table/SortableHeader'
import { ErrorModal } from '../components/ErrorModal'
import toast from 'react-hot-toast'
import type { Category } from '../lib/types'

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const { isGridLayout, setIsGridLayout } = useLayoutPreference('categories')
  const { sort, handleSort } = useTableSort('categories')
  
  const queryClient = useQueryClient()
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Motiv byl smazán')
    },
    onError: (error: Error) => {
      setErrorModal({
        isOpen: true,
        title: 'Chyba při mazání motivu',
        message: error.message
      })
    }
  })

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategory(undefined)
    setIsModalOpen(true)
  }

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCategories = sortData(filteredCategories || [], sort.key, sort.direction)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst motivy" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Motivy</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Hledat motiv..."
            />
          </div>
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
          <button onClick={handleAdd} className="btn btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-1" />
            Motiv
          </button>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Zatím nejsou definovány žádné motivy.</p>
        </div>
      ) : isGridLayout ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-700">
                    {category.emoji}
                  </span>
                </div>
                <div className="ml-3 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  {category.puzzleCount !== undefined && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ({category.puzzleCount})
                    </p>
                  )}
                </div>
                <ItemActions
                  onEdit={() => handleEdit(category)}
                  onDelete={() => handleDelete(category.id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <SortableHeader
                  label="Motiv"
                  sortKey="name"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Počet puzzlí"
                  sortKey="puzzleCount"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.emoji}</span>
                      <span className="text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {category.puzzleCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ItemActions
                      onEdit={() => handleEdit(category)}
                      onDelete={() => handleDelete(category.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? 'Upravit motiv' : 'Nový motiv'}
        size="large"
      >
        <CategoryForm
          category={selectedCategory}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </div>
  )
}