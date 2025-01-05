import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createManufacturer, updateManufacturer } from '../lib/api/manufacturers'
import toast from 'react-hot-toast'
import type { Manufacturer } from '../lib/types'
import { COUNTRIES } from '../lib/countries'
import { Factory, Flag } from 'lucide-react'

interface ManufacturerFormProps {
  manufacturer?: Manufacturer
  onClose: () => void
}

export function ManufacturerForm({ manufacturer, onClose }: ManufacturerFormProps) {
  const [form, setForm] = useState({
    name: manufacturer?.name ?? '',
    country: manufacturer?.country ?? '',
    countryCode: manufacturer?.countryCode ?? ''
  })

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (manufacturer) {
        await updateManufacturer(manufacturer.id, form)
      } else {
        await createManufacturer(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast.success(manufacturer ? 'Výrobce byl upraven' : 'Výrobce byl přidán')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.country.trim()) {
      toast.error('Vyplňte všechna povinná pole')
      return
    }
    mutate()
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = COUNTRIES.find(country => country.name === e.target.value)
    if (selectedCountry) {
      setForm({
        ...form,
        country: selectedCountry.name,
        countryCode: selectedCountry.code
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Název výrobce */}
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <Factory className="inline-block w-4 h-4 mr-1" />
              Název výrobce*
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              required
              placeholder="Např. Ravensburger"
            />
          </div>
        </section>

        {/* Země původu */}
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="country" className="form-label">
              <Flag className="inline-block w-4 h-4 mr-1" />
              Země původu*
            </label>
            <select
              id="country"
              value={form.country}
              onChange={handleCountryChange}
              className="form-select"
              required
            >
              <option value="">Vyberte zemi</option>
              {COUNTRIES.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map(country => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Náhled */}
          {form.name && form.country && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Náhled
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {COUNTRIES.find(c => c.code === form.countryCode)?.flag}
                </span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {form.name}
                </span>
              </div>
            </div>
          )}
        </section>
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
          {isPending ? 'Ukládám...' : manufacturer ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}