import { useState, useRef } from 'react'
import { Image, Link, Upload, X } from 'lucide-react'

interface PuzzleImageInputProps {
  imageUrl: string
  onImageChange: (url: string) => void
}

export function PuzzleImageInput({ imageUrl, onImageChange }: PuzzleImageInputProps) {
  const [isUrlInput, setIsUrlInput] = useState(false)
  const [tempUrl, setTempUrl] = useState(imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Kontrola typu souboru
      if (!file.type.startsWith('image/')) {
        alert('Prosím vyberte pouze obrázky')
        return
      }

      // Kontrola velikosti (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Obrázek je příliš velký. Maximální velikost je 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        onImageChange(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (tempUrl.trim()) {
      onImageChange(tempUrl.trim())
      setIsUrlInput(false)
    }
  }

  const handleRemoveImage = () => {
    onImageChange('')
    setTempUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative">
          <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Náhled"
              className="max-w-full max-h-64 object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <Image className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Přetáhněte sem obrázek nebo použijte jednu z možností níže
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Nahrát soubor
          </button>
        </div>

        <div className="flex-1">
          <button
            type="button"
            onClick={() => setIsUrlInput(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Link className="w-4 h-4 mr-2" />
            Vložit URL
          </button>
        </div>
      </div>

      {isUrlInput && (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleUrlSubmit()}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Potvrdit
            </button>
            <button
              type="button"
              onClick={() => setIsUrlInput(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}