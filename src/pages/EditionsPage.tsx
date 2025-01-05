import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEditions, deleteEdition } from '../lib/api/editions'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { EditionForm } from '../components/editions/EditionForm'
import { ItemActions } from '../components/ItemActions'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { SearchBar } from '../components/filters/SearchBar'
import { useLayoutPreference } from '../hooks/useLayoutPreference'
import { useTableSort } from '../hooks/useTableSort'
import { sortData } from '../utils/sorting'
import { SortableHeader } from '../components/table/SortableHeader'
import { ErrorModal } from '../components/ErrorModal'
import toast from 'react-hot-toast'
import type { Edition } from '../lib/types'
import { useNavigate } from 'react-router-dom'

export function EditionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  })
  const [selectedEdition, setSelectedEdition] = useState<Edition | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const { isGridLayout, setIsGridLayout } = useLayoutPreference('editions')
  const { sort, handleSort } = useTableSort('editions')
  const navigate = useNavigate()
  
  const queryClient = useQueryClient()
  const { data: editions, isLoading, error } = useQuery({
    queryKey: ['editions'],
    queryFn: getEditions
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteEdition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] })
      toast.success('Edice byla smazána')
    },
    onError: (error: Error) => {
      setErrorModal({
        isOpen: true,
        title: 'Chyba při mazání edice',
        message: error.message
      })
    }
  })

  const handleEdit = (edition: Edition) => {
    setSelectedEdition(edition)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedEdition(undefined)
    setIsModalOpen(true)
  }

  const handleFilterByEdition = (edition: Edition) => {
    navigate('/', { 
      state: { 
        edition: edition.id,
        searchTerm: '' // Reset search when filtering by edition
      } 
    })
  }

  const filteredEditions = editions?.filter(edition =>
    edition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edition.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedEditions = sortData(filteredEditions || [], sort.key, sort.direction)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst edice" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edice</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Hledat edici..."
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
            Edice
          </button>
        </div>
      </div>

      {sortedEditions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Zatím nejsou definovány žádné edice.</p>
        </div>
      ) : isGridLayout ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEditions.map((edition) => (
            <div
              key={edition.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start">
                <div className="flex-grow">
                  <button
                    onClick={() => handleFilterByEdition(edition)}
                    className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    {edition.name}
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {edition.manufacturer}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Počet puzzlí: {edition.puzzleCount}
                  </p>
                </div>
                <ItemActions
                  onEdit={() => handleEdit(edition)}
                  onDelete={() => handleDelete(edition.id)}
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
                  label="Název"
                  sortKey="name"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Výrobce"
                  sortKey="manufacturer"
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
              {sortedEditions.map((edition) => (
                <tr key={edition.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleFilterByEdition(edition)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      {edition.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {edition.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {edition.puzzleCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ItemActions
                      onEdit={() => handleEdit(edition)}
                      onDelete={() => handleDelete(edition.id)}
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
        title={selectedEdition ? 'Upravit edici' : 'Nová edice'}
      >
        <EditionForm
          edition={selectedEdition}
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