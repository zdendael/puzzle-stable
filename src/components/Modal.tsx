import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'large'
}

export function Modal({ isOpen, onClose, title, children, size = 'default' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getModalTitle = (title: string) => {
    if (title.includes('kategorii')) {
      return title.replace('kategorii', 'motiv')
    }
    return title
  }

  const getModalSize = () => {
    switch (size) {
      case 'large':
        return 'max-w-4xl min-h-[700px]'
      default:
        return 'max-w-2xl'
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        
        <div
          ref={modalRef}
          className={`relative w-full ${getModalSize()} rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{getModalTitle(title)}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}