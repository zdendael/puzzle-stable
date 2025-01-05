import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSources } from '../lib/api'
import { deleteSource } from '../lib/api/sources'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { SourceForm } from '../components/SourceForm'
import { ItemActions } from '../components/ItemActions'
import { Store, Globe, User, Building2, Plus, LayoutGrid, List, Handshake } from 'lucide-react'
import { SearchBar } from '../components/filters/SearchBar'
import { useLayoutPreference } from '../hooks/useLayoutPreference'
import { useTableSort } from '../hooks/useTableSort'
import { sortData } from '../utils/sorting'
import { SortableHeader } from '../components/table/SortableHeader'
import { SourcesSidebar } from '../components/filters/SourcesSidebar'
import { SourceUrl } from '../components/SourceUrl'
import toast from 'react-hot-toast'
import type { Source, SourceType } from '../lib/types'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

const sourceTypeConfig: Record<SourceType, { label: string; icon: typeof Store; color: string }> = {
  eshop: { label: 'E-shopy', icon: Globe, color: 'text-blue-500' },
  store: { label: 'Kamenné obchody', icon: Store, color: 'text-green-500' },
  person: { label: 'Osoby', icon: User, color: 'text-purple-500' },
  company: { label: 'Firmy', icon: Building2, color: 'text-orange-500' }
}

// Typy zdrojů, které mohou mít spolupráci
const COLLABORATION_SOURCE_TYPES = ['eshop', 'store', 'company']

export function SourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const { isGridLayout, setIsGridLayout } = useLayoutPreference('sources')
  const { sort, handleSort } = useTableSort('sources')
  const [filters, setFilters] = useState({
    types: [] as string[],
    isCollaboration: null as boolean | null,
    puzzleCount: { min: null as number | null, max: null as number | null }
  })
  
  const queryClient = useQueryClient()
  const { data: sources, isLoading, error } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Zdroj byl smazán')
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleEdit = (source: Source) => {
    setSelectedSource(source)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedSource(undefined)
    setIsModalOpen(true)
  }

  const getSourceIcon = (type: string) => {
    const config = sourceTypeConfig[type as SourceType]
    const Icon = config?.icon
    return Icon ? <Icon className={`inline w-4 h-4 mr-1 ${config.color}`} /> : null
  }

  const filteredSources = sources?.filter(source => {
    if (searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    if (filters.types.length > 0 && !filters.types.includes(source.type)) {
      return false
    }

    if (filters.isCollaboration !== null && source.isCollaboration !== filters.isCollaboration) {
      return false
    }

    if (filters.puzzleCount.min !== null && source.puzzleCount < filters.puzzleCount.min) {
      return false
    }

    if (filters.puzzleCount.max !== null && source.puzzleCount > filters.puzzleCount.max) {
      return false
    }

    return true
  })

  // Seskupení zdrojů podle typu
  const groupedSources = filteredSources?.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = []
    }
    acc[source.type].push(source)
    return acc
  }, {} as Record<SourceType, Source[]>)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst zdroje" />

  return (
    <div className="flex">
      <SourcesSidebar
        filters={filters}
        onFilterChange={setFilters}
        totalCount={sources?.length}
        filteredCount={filteredSources?.length}
      />

      <div className="flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zdroje puzzlí</h1>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Hledat zdroj..."
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
              Zdroj
            </button>
          </div>
        </div>

        {!filteredSources?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Zatím nejsou definovány žádné zdroje.</p>
          </div>
        ) : isGridLayout ? (
          <div className="space-y-8">
            {(Object.keys(sourceTypeConfig) as SourceType[]).map(type => {
              const sourcesOfType = groupedSources?.[type] || []
              if (sourcesOfType.length === 0) return null

              const { label, icon: Icon, color } = sourceTypeConfig[type]

              return (
                <div key={type}>
                  <div className="flex items-center mb-4">
                    <Icon className={`w-5 h-5 ${color} mr-2`} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sourcesOfType.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((source) => (
                      <div
                        key={source.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
                      >
                        <div className="flex items-start">
                          <div className="ml-3 flex-grow">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{source.name}</h3>
                              {source.isCollaboration && (
                                <Handshake 
                                  className="w-5 h-5 text-indigo-500" 
                                  title={`Spolupráce${source.collaborationStart ? ` od ${format(new Date(source.collaborationStart), 'd. M. yyyy', { locale: cs })}` : ''}${source.collaborationEnd ? ` do ${format(new Date(source.collaborationEnd), 'd. M. yyyy', { locale: cs })}` : ''}`}
                                />
                              )}
                            </div>
                            {source.url && (
                              <SourceUrl url={source.url} showFullUrl={true} />
                            )}
                            {source.address && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {source.address}
                              </p>
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span title="Celkový počet puzzlí">
                                {source.puzzleCount || 0} puzzlí
                              </span>
                              {COLLABORATION_SOURCE_TYPES.includes(source.type) && (
                                <span className="ml-2" title="Počet puzzlí ze spolupráce">
                                  ({source.collaborationCount || 0} ze spolupráce)
                                </span>
                              )}
                            </div>
                          </div>
                          <ItemActions
                            onEdit={() => handleEdit(source)}
                            onDelete={() => handleDelete(source.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.keys(sourceTypeConfig) as SourceType[]).map(type => {
              const sourcesOfType = groupedSources?.[type] || []
              if (sourcesOfType.length === 0) return null

              const { label, icon: Icon, color } = sourceTypeConfig[type]
              const sortedSources = sortData(sourcesOfType, sort.key, sort.direction)
              const showCollaboration = COLLABORATION_SOURCE_TYPES.includes(type)

              return (
                <div key={type}>
                  <div className="flex items-center mb-4">
                    <Icon className={`w-5 h-5 ${color} mr-2`} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h2>
                  </div>
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
                          {type === 'eshop' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              URL
                            </th>
                          )}
                          {type === 'store' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Adresa
                            </th>
                          )}
                          <SortableHeader
                            label="Počet puzzlí"
                            sortKey="puzzleCount"
                            currentSort={sort}
                            onSort={handleSort}
                          />
                          {showCollaboration && (
                            <SortableHeader
                              label="Spolupráce"
                              sortKey="collaborationCount"
                              currentSort={sort}
                              onSort={handleSort}
                            />
                          )}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Akce
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedSources.map((source) => (
                          <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getSourceIcon(source.type)}
                                <span className="text-gray-900 dark:text-white">{source.name}</span>
                                {source.isCollaboration && (
                                  <Handshake 
                                    className="w-4 h-4 ml-2 text-indigo-500" 
                                    title={`Spolupráce${source.collaborationStart ? ` od ${format(new Date(source.collaborationStart), 'd. M. yyyy', { locale: cs })}` : ''}${source.collaborationEnd ? ` do ${format(new Date(source.collaborationEnd), 'd. M. yyyy', { locale: cs })}` : ''}`}
                                  />
                                )}
                              </div>
                            </td>
                            {type === 'eshop' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {source.url && <SourceUrl url={source.url} showFullUrl={true} />}
                              </td>
                            )}
                            {type === 'store' && (
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {source.address}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {source.puzzleCount || 0}
                            </td>
                            {showCollaboration && (
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {source.collaborationCount || 0}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <ItemActions
                                onEdit={() => handleEdit(source)}
                                onDelete={() => handleDelete(source.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedSource ? 'Upravit zdroj' : 'Nový zdroj'}
        >
          <SourceForm
            source={selectedSource}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  )
}