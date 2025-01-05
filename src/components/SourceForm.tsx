import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSource, updateSource } from '../lib/api/sources'
import toast from 'react-hot-toast'
import type { Source, SourceType } from '../lib/types'
import { Store, Globe, User, Building2, Handshake } from 'lucide-react'

interface SourceFormProps {
  source?: Source
  onClose: () => void
}

const sourceTypes: { value: SourceType; label: string; icon: typeof Store }[] = [
  { value: 'eshop', label: 'E-shop', icon: Globe },
  { value: 'store', label: 'Kamenný obchod', icon: Store },
  { value: 'person', label: 'Osoba', icon: User },
  { value: 'company', label: 'Firma', icon: Building2 }
]

const COLLABORATION_TYPES = ['eshop', 'store', 'company'] // Firma je již zahrnuta

export function SourceForm({ source, onClose }: SourceFormProps) {
  const [form, setForm] = useState({
    name: source?.name ?? '',
    type: source?.type ?? 'eshop',
    url: source?.url ?? '',
    address: source?.address ?? '',
    isCollaboration: source?.isCollaboration ?? false,
    collaborationStart: source?.collaborationStart ?? '',
    collaborationEnd: source?.collaborationEnd ?? ''
  })

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (source) {
        await updateSource(source.id, form)
      } else {
        await createSource(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      toast.success(source ? 'Zdroj byl upraven' : 'Zdroj byl přidán')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Vyplň název zdroje')
      return
    }
    if (form.type === 'eshop' && !form.url?.trim()) {
      toast.error('Vyplň URL e-shopu')
      return
    }
    if (form.isCollaboration && !form.collaborationStart) {
      toast.error('Vyplň datum začátku spolupráce')
      return
    }
    if (form.collaborationEnd && form.collaborationStart && new Date(form.collaborationEnd) < new Date(form.collaborationStart)) {
      toast.error('Datum ukončení spolupráce nemůže být dřívější než datum začátku')
      return
    }
    mutate()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Typ zdroje */}
        <section className="form-section">
          <h3 className="form-section-title">Typ zdroje</h3>
          <div className="grid grid-cols-2 gap-4">
            {sourceTypes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, type: value })}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors ${
                  form.type === value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${
                  form.type === value
                    ? 'text-indigo-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  form.type === value
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Základní informace */}
        <section className="form-section">
          <h3 className="form-section-title">Základní informace</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {form.type === 'person' ? 'Jméno*' : 'Název*'}
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                required
                placeholder={form.type === 'person' ? 'Jan Novák' : 'Název zdroje'}
              />
            </div>

            {form.type === 'eshop' && (
              <div className="form-group">
                <label htmlFor="url" className="form-label">
                  URL e-shopu*
                </label>
                <input
                  type="url"
                  id="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="form-input"
                  required
                  placeholder="https://www.example.com"
                />
              </div>
            )}

            {form.type === 'store' && (
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Adresa
                </label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="form-input"
                  placeholder="Ulice 123&#10;123 45 Město"
                />
              </div>
            )}
          </div>
        </section>

        {/* Spolupráce */}
        {COLLABORATION_TYPES.includes(form.type) && (
          <section className="form-section">
            <h3 className="form-section-title">Spolupráce</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCollaboration"
                  checked={form.isCollaboration}
                  onChange={(e) => setForm({ ...form, isCollaboration: e.target.checked })}
                  className="form-checkbox"
                />
                <label htmlFor="isCollaboration" className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <Handshake className="w-4 h-4 mr-1" />
                  Spolupráce
                </label>
              </div>

              {form.isCollaboration && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="form-group">
                    <label htmlFor="collaborationStart" className="form-label">
                      Začátek spolupráce*
                    </label>
                    <input
                      type="date"
                      id="collaborationStart"
                      value={form.collaborationStart}
                      onChange={(e) => setForm({ ...form, collaborationStart: e.target.value })}
                      className="form-input"
                      required={form.isCollaboration}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="collaborationEnd" className="form-label">
                      Konec spolupráce
                    </label>
                    <input
                      type="date"
                      id="collaborationEnd"
                      value={form.collaborationEnd}
                      onChange={(e) => setForm({ ...form, collaborationEnd: e.target.value })}
                      min={form.collaborationStart}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 flex justify-end space-x-2">
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
          {isPending ? 'Ukládám...' : source ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}