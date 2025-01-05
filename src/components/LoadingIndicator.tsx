import { Loader2 } from 'lucide-react'

interface LoadingIndicatorProps {
  message?: string
  className?: string
}

export function LoadingIndicator({ 
  message = 'Načítám další položky...', 
  className = '' 
}: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center justify-center p-4 text-gray-500 dark:text-gray-400 ${className}`}>
      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      <span>{message}</span>
    </div>
  )
}