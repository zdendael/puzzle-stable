import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createWishListItem, updateWishListItem } from '../../lib/api/wishlist'
import { getManufacturers } from '../../lib/api/manufacturers'
import { getTags } from '../../lib/api/tags'
import { getCategories } from '../../lib/api/categories'
import { getSources } from '../../lib/api/sources'
import toast from 'react-hot-toast'
import type { WishListItem } from '../../lib/types'
import { Package, Hash, DollarSign, Search, Tags } from 'lucide-react'
import { PuzzleImageInput } from '../puzzle/PuzzleImageInput'
import { scrapePuzzle } from '../../lib/scraping'

interface WishListFormProps {
  item?: WishListItem
  onClose: () => void
}

export function WishListForm({ item, onClose }: WishListFormProps) {
  const [form, setForm] = useState({
    name: item?.name ?? '',
    manufacturer: item?.manufacturer ?? '',
    importUrl: '',
    pieces: item?.pieces ?? 0,
    categories: item?.categories ?? [],
    image_url: item?.image_url ?? '',
    price: item?.price ?? 0,
    source: item?.source,
    url: item?.url ?? '',
    in_stock: item?.in_stock ?? true,
    notes: item?.notes ?? '',
    tags: item?.tags ?? [],
    priority: item?.priority ?? 'low'
  })
  const [isImporting, setIsImporting] = useState(false)

  const [errors, setErrors] = useState({
    name: false,
    manufacturer: false,
    pieces: false,
    categories: false
  })

  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()
  const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers })
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: getSources })

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSource = sources?.find(s => s.id === form.source?.id)
  const isEshop = selectedSource?.type === 'eshop'

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (item) {
        await updateWishListItem(item.id!, form)
      } else {
        await createWishListItem(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(item ? 'Položka byla upravena' : 'Položka byla přidána')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const validateForm = () => {
    const newErrors = {
      name: !form.name.trim(),
      manufacturer: !form.manufacturer,
      pieces: form.pieces <= 0,
      categories: form.categories.length === 0
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      mutate()
    }
  }

  const handleImport = async () => {
    if (!form.importUrl) return

    const toastId = toast.loading('Načítám data z e-shopu...')
    try {
      setIsImporting(true)
      const data = await scrapePuzzle(form.importUrl)
      setForm(prev => ({
        ...prev,
        name: data.name,
        manufacturer: data.manufacturer,
        pieces: data.pieces,
        price: data.price,
        image_url: data.image_url,
        in_stock: data.in_stock,
        url: data.url
      }))
      toast.success('Data byla úspěšně importována', { id: toastId })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se importovat data', { id: toastId })
      console.error('Chyba při importu:', error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* URL Import */}
      <section className="form-section">
        <div className="form-group">
          <label className="form-label">Import z e-shopu</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Vložte URL puzzle z e-shopu"
              className="form-input flex-1"
              value={form.importUrl}
              onChange={(e) => setForm({ ...form, importUrl: e.target.value })}
            />
            <button
              type="button"
              onClick={handleImport}
              className="btn btn-secondary"
              disabled={!form.importUrl || isImporting}
            >
              {isImporting ? 'Importuji...' : 'Importovat'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Podporované e-shopy: puzzle-eshop.cz, puzzle-puzzle.cz, skladejpuzzle.cz
          </p>
        </div>
      </section>

      {/* Obrázek */}
      <section className="form-section">
        <h3 className="form-section-title">Obrázek puzzle</h3>
        <PuzzleImageInput
          imageUrl={form.image_url}
          onImageChange={(url) => setForm({ ...form, image_url: url })}
        />
      </section>

      {/* Základní informace */}
      <section className="form-section">
        <h3 className="form-section-title">Základní informace</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <Package className="inline-block w-4 h-4 mr-1" />
              Název puzzle*
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Název puzzle"
            />
            {errors.name && (
              <p className="form-error">Vyplň název puzzle</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Výrobce*
            </label>
            <select
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              className={`form-select ${errors.manufacturer ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Vyber výrobce</option>
              {manufacturers?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.name}>
                  {manufacturer.name}
                </option>
              ))}
            </select>
            {errors.manufacturer && (
              <p className="form-error">Vyber výrobce</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Hash className="inline-block w-4 h-4 mr-1" />
              Počet dílků*
            </label>
            <input
              type="number"
              value={form.pieces}
              onChange={(e) => setForm({ ...form, pieces: parseInt(e.target.value) || 0 })}
              className={`form-input ${errors.pieces ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              min="1"
            />
            {errors.pieces && (
              <p className="form-error">Počet dílků musí být větší než 0</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <DollarSign className="inline-block w-4 h-4 mr-1" />
              Cena (Kč)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              className="form-input"
              min="0"
            />
          </div>

          <div className={isEshop ? 'md:col-span-2 grid grid-cols-2 gap-6' : ''}>
            <div className="form-group">
              <label className="form-label">Zdroj</label>
              <select
                value={form.source?.id ?? ''}
                onChange={(e) => {
                  const sourceId = parseInt(e.target.value)
                  const selectedSource = sources?.find(s => s.id === sourceId)
                  setForm({ ...form, source: selectedSource, url: selectedSource?.type !== 'eshop' ? '' : form.url })
                }}
                className="form-select"
              >
                <option value="">Vyber zdroj</option>
                {sources?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            {isEshop && (
              <div className="form-group">
                <label className="form-label">URL e-shopu</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="form-input"
                  placeholder="https://"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Priorita a dostupnost */}
      <section className="form-section">
        <h3 className="form-section-title">Priorita a dostupnost</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Priorita</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Nízká', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' },
                { value: 'medium', label: 'Střední', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' },
                { value: 'high', label: 'Vysoká', color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' }
              ].map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setForm({ ...form, priority: priority.value as 'low' | 'medium' | 'high' })}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    form.priority === priority.value
                      ? priority.color
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dostupnost</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Skladem
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Kategorizace */}
      <section className="form-section">
        <h3 className="form-section-title">Kategorizace</h3>
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              Motivy* <span className="form-hint">(vyber alespoň jeden)</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Hledat motivy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <div className={`grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
              errors.categories ? 'border border-red-300 rounded-md p-2' : ''
            }`}>
              {filteredCategories?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((category) => (
                <label key={category.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category.name)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...form.categories, category.name]
                        : form.categories.filter(c => c !== category.name)
                      setForm({ ...form, categories: newCategories })
                    }}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{category.emoji} {category.name}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="form-error">Vyber alespoň jeden motiv</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tags className="inline-block w-4 h-4 mr-1" />
              Štítky
            </label>
            <div className="flex flex-wrap gap-2">
              {tags?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const newTags = form.tags.includes(tag.name)
                      ? form.tags.filter(t => t !== tag.name)
                      : [...form.tags, tag.name]
                    setForm({ ...form, tags: newTags })
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    form.tags.includes(tag.name)
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag.emoji} {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Poznámky */}
      <section className="form-section">
        <div className="form-group">
          <label className="form-label">Poznámky</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="form-input"
            rows={3}
          />
        </div>
      </section>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          disabled={isPending}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Ukládám...' : item ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}