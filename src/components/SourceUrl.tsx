import { ExternalLink } from 'lucide-react'

interface SourceUrlProps {
  url: string
  showFullUrl?: boolean
}

export function SourceUrl({ url, showFullUrl = false }: SourceUrlProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(url)

  if (showFullUrl) {
    return (
      <div className="flex items-center gap-2 break-all">
        {faviconUrl && (
          <img 
            src={faviconUrl} 
            alt="" 
            className="w-4 h-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          {url}
        </a>
      </div>
    )
  }

  return faviconUrl ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      title="Otevřít e-shop"
    >
      <img 
        src={faviconUrl} 
        alt="" 
        className="w-4 h-4"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </a>
  ) : (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      title="Otevřít e-shop"
    >
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}