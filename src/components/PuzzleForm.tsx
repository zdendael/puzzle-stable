import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createPuzzle, updatePuzzle } from '../lib/api/puzzles'
import { getManufacturers } from '../lib/api/manufacturers'
import { getTags } from '../lib/api/tags'
import { getCategories } from '../lib/api/categories'
import { getSources } from '../lib/api/sources'
import { getEditionsByManufacturer } from '../lib/api/editions'
import toast from 'react-hot-toast'
import type { Puzzle } from '../lib/types'
import { Package, Hash, BarChart3, Calendar, DollarSign, Search, Tags, BookOpen, Factory, Youtube } from 'lucide-react'
import { StarRating } from './StarRating'
import { PuzzleImageInput } from './puzzle/PuzzleImageInput'

interface PuzzleFormProps {
  puzzle?: Puzzle
  initialData?: Partial<Puzzle>
  onClose: () => void
  onSuccess?: () => void
}

export function PuzzleForm({ puzzle, initialData, onClose, onSuccess }: PuzzleFormProps) {
  const [form, setForm] = useState({
    name: puzzle?.name ?? initialData?.name ?? '',
    manufacturer: puzzle?.manufacturer ?? initialData?.manufacturer ?? '',
    pieces: puzzle?.pieces ?? initialData?.pieces ?? 0,
    missing_pieces: puzzle?.missing_pieces ?? 0,
    difficulty: puzzle?.difficulty ?? 'unrated',
    categories: puzzle?.categories ?? initialData?.categories ?? [],
    image_url: puzzle?.image_url ?? initialData?.image_url ?? '',
    acquisition_date: puzzle?.acquisition_date ?? new Date(),
    removal_date: puzzle?.removal_date ?? null,
    purchase_date: puzzle?.purchase_date ?? initialData?.purchase_date ?? null,
    price: puzzle?.price ?? initialData?.price ?? 0,
    is_gift: puzzle?.is_gift ?? initialData?.is_gift ?? false,
    is_collaboration: puzzle?.is_collaboration ?? initialData?.is_collaboration ?? false,
    is_own_purchase: puzzle?.is_own_purchase ?? initialData?.is_own_purchase ?? false,
    in_collection: puzzle?.in_collection ?? initialData?.in_collection ?? true,
    notes: puzzle?.notes ?? initialData?.notes ?? '',
    tags: puzzle?.tags ?? initialData?.tags ?? [],
    youtube_url: puzzle?.youtube_url ?? initialData?.youtube_url ?? '',
    edition_id: puzzle?.edition_id ?? initialData?.edition_id ?? null
  })

  const [errors, setErrors] = useState({
    name: false,
    manufacturer: false,
    pieces: false,
    acquisition_date: false,
    acquisition_type: false,
    categories: false,
    youtube_url: false
  })

  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()
  const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers })
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: getSources })
  const { data: editions } = useQuery({ 
    queryKey: ['editions', form.manufacturer],
    queryFn: () => {
      const manufacturer = manufacturers?.find(m => m.name === form.manufacturer)
      return manufacturer ? getEditionsByManufacturer(manufacturer.id) : Promise.resolve([])
    },
    enabled: !!form.manufacturer
  })

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSource = sources?.find(s => s.id === form.source?.id)
  const isEshop = selectedSource?.type === 'eshop'

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (puzzle) {
        await updatePuzzle(puzzle.id!, {
          ...form,
          acquisition_date: form.acquisition_date,
          removal_date: form.removal_date,
          purchase_date: form.purchase_date,
          youtube_url: form.youtube_url || null
        })
      } else {
        await createPuzzle(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzles'] })
      toast.success(puzzle ? 'Puzzle bylo upraveno' : 'Puzzle bylo přidáno')
      onSuccess?.()
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
      acquisition_date: !form.acquisition_date,
      acquisition_type: !form.is_gift && !form.is_collaboration && !form.is_own_purchase,
      categories: form.categories.length === 0,
      youtube_url: form.is_collaboration && form.youtube_url && 
        !/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+$/.test(form.youtube_url)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            />
            {errors.name && (
              <p className="form-error">Vyplň název puzzle</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Factory className="inline-block w-4 h-4 mr-1" />
              Výrobce*
            </label>
            <select
              value={form.manufacturer}
              onChange={(e) => {
                setForm({ 
                  ...form, 
                  manufacturer: e.target.value,
                  edition_id: null
                })
              }}
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

          {form.manufacturer && editions?.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                <BookOpen className="inline-block w-4 h-4 mr-1" />
                Edice
              </label>
              <select
                value={form.edition_id || ''}
                onChange={(e) => setForm({ ...form, edition_id: e.target.value ? parseInt(e.target.value) : null })}
                className="form-select"
              >
                <option value="">Vyber edici</option>
                {editions?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((edition) => (
                  <option key={edition.id} value={edition.id}>
                    {edition.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              <Hash className="inline-block w-4 h-4 mr-1" />
              Chybějící dílky
            </label>
            <input
              type="number"
              min="0"
              value={form.missing_pieces}
              onChange={(e) => setForm({ ...form, missing_pieces: parseInt(e.target.value) || 0 })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Datum přidání*
            </label>
            <input
              type="date"
              value={form.acquisition_date ? new Date(form.acquisition_date).toISOString().split('T')[0] : ''}
              onChange={(e) => setForm({ ...form, acquisition_date: e.target.value ? new Date(e.target.value) : null })}
              className={`form-input ${errors.acquisition_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.acquisition_date && (
              <p className="form-error">Vyber datum přidání</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Zdroj</label>
            <select
              value={form.source?.id ?? ''}
              onChange={(e) => {
                const sourceId = parseInt(e.target.value)
                const selectedSource = sources?.find(s => s.id === sourceId)
                setForm({ ...form, source: selectedSource })
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
        </div>
      </section>

      {/* Hodnocení a obtížnost */}
      <section className="form-section">
        <h3 className="form-section-title">Hodnocení a obtížnost</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <BarChart3 className="inline-block w-4 h-4 mr-1" />
              Obtížnost
            </label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'unrated' | 'easy' | 'medium' | 'hard' })}
              className="form-select"
            >
              <option value="unrated">Nehodnoceno</option>
              <option value="easy">Snadné</option>
              <option value="medium">Střední</option>
              <option value="hard">Těžké</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hodnocení</label>
            <StarRating
              rating={form.rating ?? undefined}
              onChange={(rating) => setForm({ ...form, rating })}
            />
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="form-section">
        <h3 className="form-section-title">Video</h3>
        <div className="form-group">
          <label className="form-label">
            <Youtube className="inline-block w-4 h-4 mr-1" />
            Odkaz na YouTube video
          </label>
          <input
            type="url"
            value={form.youtube_url || ''}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            className={`form-input ${
              errors.youtube_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="https://youtube.com/watch?v=..."
          />
          {errors.youtube_url && (
            <p className="form-error">Neplatný formát YouTube URL</p>
          )}
        </div>
      </section>

      {/* Způsob získání */}
      <section className="form-section">
        <h3 className="form-section-title">Způsob získání*</h3>
        <div className="space-y-4">
          <div className={`flex flex-wrap gap-4 ${errors.acquisition_type ? 'border border-red-300 rounded-md p-2' : ''}`}>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={form.is_gift}
                onChange={() => setForm({
                  ...form,
                  is_gift: true,
                  is_collaboration: false,
                  is_own_purchase: false,
                  youtube_url: '',
                  published_at: null,
                  price: 0,
                  purchase_date: null
                })}
                className="form-radio"
                name="acquisition_type"
               />
               <span className="ml-2 text-gray-700 dark:text-gray-300">Dárek</span>
             </label>
             <label className="inline-flex items-center">
               <input
                 type="radio"
                 checked={form.is_collaboration}
                 onChange={() => setForm({
                   ...form,
                   is_gift: false,
                   is_collaboration: true,
                   is_own_purchase: false,
                   price: 0
                 })}
                 className="form-radio"
                 name="acquisition_type"
               />
               <span className="ml-2 text-gray-700 dark:text-gray-300">Spolupráce</span>
             </label>
             <label className="inline-flex items-center">
               <input
                 type="radio"
                 checked={form.is_own_purchase}
                 onChange={() => setForm({
                   ...form,
                   is_gift: false,
                   is_collaboration: false,
                   is_own_purchase: true,
                   price: 0
                 })}
                 className="form-radio"
                 name="acquisition_type"
               />
               <span className="ml-2 text-gray-700 dark:text-gray-300">Vlastní nákup</span>
             </label>
           </div>
           {errors.acquisition_type && (
             <p className="form-error">Vyber způsob získání</p>
           )}

          {form.is_own_purchase && (
            <>
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

              <div className="form-group">
                <label className="form-label">
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Datum nákupu
                </label>
                <input
                  type="date"
                  value={form.purchase_date ? new Date(form.purchase_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value ? new Date(e.target.value) : null })}
                  className="form-input"
                />
              </div>
            </>
          )}
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

      {/* Stav kolekce */}
      <section className="form-section">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form.in_collection}
              onChange={(e) => setForm({
                ...form,
                in_collection: e.target.checked,
                removal_date: e.target.checked ? null : new Date()
              })}
              className="form-checkbox"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Součást stálé sbírky
            </label>
          </div>

          {!form.in_collection && (
            <div className="form-group">
              <label className="form-label">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Datum odebrání ze sbírky
              </label>
              <input
                type="date"
                value={form.removal_date ? new Date(form.removal_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, removal_date: e.target.value ? new Date(e.target.value) : null })}
                className="form-input"
              />
            </div>
          )}
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
          {isPending ? 'Ukládám...' : puzzle ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}