import { useState } from 'react'
import type { WishListItem } from '../../lib/types'
import toast from 'react-hot-toast'

interface ReservationFormProps {
  item: WishListItem
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

export function ReservationForm({ item, onSubmit, onClose }: ReservationFormProps) {
  const [name, setName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    
    if (!trimmedName || trimmedName.length < 2) {
      toast.error('Zadejte prosím své jméno (minimálně 2 znaky)')
      return
    }

    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    try {
      setIsPending(true)
      await onSubmit(trimmedName)
      onClose()
    } catch (error) {
      console.error('Chyba při vytváření rezervace:', error)
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se vytvořit rezervaci')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Rezervace puzzle
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {showConfirmation ? (
            <>
              Opravdu si přejete rezervovat puzzle <strong>{item.name}</strong>? Tuto akci nelze vzít zpět.
            </>
          ) : (
            <>
              Chystáte se rezervovat puzzle <strong>{item.name}</strong>. Pro dokončení rezervace prosím zadejte své jméno. Pokud nechcete, aby vás Počmáraná Puzzlařka poznala (bude to tajný dárek), zadejte smyšlené jméno. :)
            </>
          )}
        </p>

        {!showConfirmation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vaše jméno
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              placeholder="Jan Novák"
              disabled={isPending}
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="button"
          onClick={showConfirmation ? () => setShowConfirmation(false) : onClose}
          className="btn btn-secondary"
          disabled={isPending}
        >
          {showConfirmation ? 'Zpět' : 'Zrušit'}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Rezervuji...' : showConfirmation ? 'Potvrdit rezervaci' : 'Pokračovat'}
        </button>
      </div>
    </form>
  )
}