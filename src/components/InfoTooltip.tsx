import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  text: string
  popup?: boolean
}

export function InfoTooltip({ text, popup = false }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && tooltipRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()
        const windowWidth = window.innerWidth
        const spaceOnRight = windowWidth - buttonRect.right
        
        // Pokud není dostatek místa vpravo (méně než šířka tooltipu + 20px margin)
        setTooltipPosition(spaceOnRight < tooltipRect.width + 20 ? 'left' : 'right')
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isOpen])

  if (popup) {
    return (
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          title="Co to znamená?"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div 
              ref={tooltipRef}
              className={`absolute z-50 w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
                tooltipPosition === 'left' ? 'right-full mr-2' : 'left-full ml-2'
              }`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block group">
      <button
        ref={buttonRef}
        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        title="Co to znamená?"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      <div 
        ref={tooltipRef}
        className={`invisible group-hover:visible absolute z-50 w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
          tooltipPosition === 'left' ? 'right-full mr-2' : 'left-full ml-2'
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
      </div>
    </div>
  )
}