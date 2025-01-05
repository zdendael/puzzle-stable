import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
    </div>
  )
}