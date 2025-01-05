import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTags, deleteTag } from '../lib/api/tags'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { TagForm } from '../components/TagForm'
import { ItemActions } from '../components/ItemActions'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { SearchBar } from '../components/filters/SearchBar'
import { useLayoutPreference } from '../hooks/useLayoutPreference'
import { useTableSort } from '../hooks/useTableSort'
import { sortData } from '../utils/sorting'
import { SortableHeader } from '../components/table/SortableHeader'
import { ErrorModal } from '../components/ErrorModal'
import toast from 'react-hot-toast'
import type { Tag } from '../lib/types'

export function TagsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  })
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const { isGridLayout, setIsGridLayout } = useLayoutPreference('tags')
  const { sort, handleSort } = useTableSort('tags')
  
  const queryClient = useQueryClient()
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Štítek byl smazán')
    },
    onError: (error: Error) => {
      setErrorModal({
        isOpen: true,
        title: 'Chyba při mazání štítku',
        message: error.message
      })
    }
  })

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedTag(undefined)
    setIsModalOpen(true)
  }

  const filteredTags = tags?.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedTags = sortData(filteredTags || [], sort.key, sort.direction)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst štítky" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Štítky</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Hledat štítek..."
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
            Štítek
          </button>
        </div>
      </div>

      {sortedTags.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Zatím nejsou definovány žádné štítky.</p>
        </div>
      ) : isGridLayout ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.emoji}
                  </span>
                </div>
                <div className="ml-3 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tag.name}</h3>
                  {tag.puzzleCount !== undefined && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ({tag.puzzleCount})
                    </p>
                  )}
                </div>
                <ItemActions
                  onEdit={() => handleEdit(tag)}
                  onDelete={() => handleDelete(tag.id)}
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
                  label="Štítek"
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
              {sortedTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xl mr-3"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.emoji}
                      </span>
                      <span className="text-gray-900 dark:text-white">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {tag.puzzleCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ItemActions
                      onEdit={() => handleEdit(tag)}
                      onDelete={() => handleDelete(tag.id)}
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
        title={selectedTag ? 'Upravit štítek' : 'Nový štítek'}
        size="large"
      >
        <TagForm
          tag={selectedTag}
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