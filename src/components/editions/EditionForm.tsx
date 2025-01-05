import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createEdition, updateEdition } from '../../lib/api/editions'
import { getManufacturers } from '../../lib/api/manufacturers'
import toast from 'react-hot-toast'
import type { Edition } from '../../lib/types'

interface EditionFormProps {
  edition?: Edition;
  onClose: () => void;
}

export function EditionForm({ edition, onClose }: EditionFormProps) {
  const [form, setForm] = useState({
    name: edition?.name ?? '',
    manufacturer_id: edition?.manufacturer_id ?? 0
  })

  const queryClient = useQueryClient()
  const { data: manufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (edition) {
        await updateEdition(edition.id, form)
      } else {
        await createEdition(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] })
      toast.success(edition ? 'Edice byla upravena' : 'Edice byla přidána')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Vyplňte název edice')
      return
    }
    if (!form.manufacturer_id) {
      toast.error('Vyberte výrobce')
      return
    }
    mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Výrobce*
        </label>
        <select
          id="manufacturer"
          value={form.manufacturer_id}
          onChange={(e) => setForm({ ...form, manufacturer_id: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        >
          <option value="">Vyberte výrobce</option>
          {manufacturers?.sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((manufacturer) => (
            <option key={manufacturer.id} value={manufacturer.id}>
              {manufacturer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Název edice*
        </label>
        <input
          type="text"
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>

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
          {isPending ? 'Ukládám...' : edition ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}