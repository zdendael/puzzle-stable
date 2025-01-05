import { AlertTriangle, X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}