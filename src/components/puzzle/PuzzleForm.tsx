// Aktualizace formuláře pro lepší mobilní zobrazení
import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createPuzzle, updatePuzzle } from '../../lib/api/puzzles'
import { getManufacturers } from '../../lib/api/manufacturers'
import { getTags } from '../../lib/api/tags'
import { getCategories } from '../../lib/api/categories'
import { getSources } from '../../lib/api/sources'
import { getEditionsByManufacturer } from '../../lib/api/editions'
import toast from 'react-hot-toast'
import type { Puzzle } from '../../lib/types'
import { Package, Hash, BarChart3, Calendar, DollarSign, Search, Tags, BookOpen, Factory, Youtube } from 'lucide-react'
import { StarRating } from '../StarRating'
import { PuzzleImageInput } from './PuzzleImageInput'

interface PuzzleFormProps {
  puzzle?: Puzzle
  initialData?: Partial<Puzzle>
  onClose: () => void
  onSuccess?: () => void
}

export function PuzzleForm({ puzzle, initialData, onClose, onSuccess }: PuzzleFormProps) {
  // Existující state a query hooks zůstávají stejné
  const [form, setForm] = useState({
    name: puzzle?.name ?? initialData?.name ?? '',
    manufacturer: puzzle?.manufacturer ?? initialData?.manufacturer ?? '',
    pieces: puzzle?.pieces ?? initialData?.pieces ?? 0,
    missing_pieces: puzzle?.missing_pieces ?? 0,
    difficulty: puzzle?.difficulty ?? initialData?.difficulty ?? 'unrated' as const,
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
    rating: puzzle?.rating ?? initialData?.rating ?? null,
    source: puzzle?.source ?? initialData?.source ?? null,
    youtube_url: puzzle?.youtube_url ?? initialData?.youtube_url ?? '',
    edition_id: puzzle?.edition_id ?? initialData?.edition_id ?? null
  })

  const [errors, setErrors] = useState({
    name: false,
    manufacturer: false,
    pieces: false,
    youtube_url: false
  })
  const validateForm = () => {
    const newErrors = {
      name: !form.name.trim(),
      manufacturer: !form.manufacturer,
      pieces: form.pieces <= 0,
      youtube_url: form.is_collaboration && form.youtube_url ? 
        !/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+$/.test(form.youtube_url) 
        : false
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Odesílám formulář:', form)
      console.log('Odesílám formulář:', form)
      mutate()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <Youtube className="inline-block w-4 h-4 mr-1" />
              Odkaz na YouTube video
            </label>
            <input
              type="url"
              value={form.youtube_url || ''}
              onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
              className={`form-input ${errors.youtube_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="https://youtube.com/watch?v=..."
            />
            {errors.youtube_url && (
              <p className="form-error">Neplatný formát YouTube URL</p>
            )}
          </div>
        </div>
      </section>

      {/* Další pole formuláře s podobnými úpravami pro mobilní zobrazení */}

      {/* Zdroj */}
      <section className="form-section">
        <h3 className="form-section-title">Zdroj</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Zdroj</label>
            <select
              value={form.source?.id || ''}
              onChange={(e) => {
                const sourceId = parseInt(e.target.value)
                const selectedSource = sources?.find(s => s.id === sourceId)
                setForm({ 
                  ...form, 
                  source: selectedSource || null,
                  url: selectedSource?.type === 'eshop' ? form.url : ''
                })
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
                  price: 0
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
                   youtube_url: '',
                   price: 0
                 })}
                 className="form-radio"
                 name="acquisition_type"
               />
               <span className="ml-2 text-gray-700 dark:text-gray-300">Vlastní nákup</span>
             </label>
           </div>
         </div>
       </section>

      {/* Hodnocení */}
      <section className="form-section">
        <h3 className="form-section-title">Hodnocení</h3>
        <div className="form-group">
          <label className="form-label">Počet hvězdiček</label>
          <StarRating
            rating={form.rating || undefined}
            onChange={(rating) => setForm({ ...form, rating })}
          />
        </div>
      </section>

      {/* Poznámky */}

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary w-full sm:w-auto"
          disabled={isPending}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={isPending}
        >
          {isPending ? 'Ukládám...' : puzzle ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}