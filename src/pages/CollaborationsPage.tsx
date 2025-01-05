import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPuzzles } from '../lib/api'
import { Youtube, Calendar, Eye, ThumbsUp, MessageCircle, Puzzle, ExternalLink } from 'lucide-react'
import { getVideoIdFromUrl, getVideoDetails, getYoutubeThumbnailUrl, getYoutubeFallbackThumbnailUrl } from '../lib/youtube'
import { formatDate, formatNumber } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Modal } from '../components/Modal'
import { YouTubeModal } from '../components/puzzle/YouTubeModal'
import type { YouTubeVideo } from '../lib/types'

type CollaborationStatus = 'all' | 'published' | 'unpublished'

export function CollaborationsPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<CollaborationStatus>('published')
  const [videoType, setVideoType] = useState<'all' | 'collaboration' | 'own'>('collaboration')
  const [videoStats, setVideoStats] = useState<{ [key: string]: YouTubeVideo }>({})
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | undefined>()

  const { data: puzzles, isLoading, error } = useQuery({
    queryKey: ['puzzles'],
    queryFn: getPuzzles
  })

  // Načtení statistik videí
  useEffect(() => {
    const loadVideoStats = async () => {
      const stats: Record<string, YouTubeVideo> = {}
      
      for (const puzzle of puzzles || []) {
        if (puzzle.youtube_url) {
          const videoId = getVideoIdFromUrl(puzzle.youtube_url)
          if (videoId) {
            const details = await getVideoDetails(videoId)
            if (details) {
              stats[videoId] = details
            }
          }
        }
      }
      
      setVideoStats(stats)
    }

    if (puzzles?.length) {
      loadVideoStats()
    }
  }, [puzzles])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Nepodařilo se načíst data" />

  // Filtrujeme puzzle ze spolupráce a ta s videem
  const relevantPuzzles = puzzles
    ?.filter(p => p.is_collaboration || p.youtube_url)
    .filter(p => {
      if (videoType === 'collaboration') return p.is_collaboration
      if (videoType === 'own') return !p.is_collaboration
      return true
    })
    .sort((a, b) => {
      // Pokud obě puzzle mají video, řadíme podle data publikace
      if (a.youtube_url && b.youtube_url) {
        const videoIdA = getVideoIdFromUrl(a.youtube_url)
        const videoIdB = getVideoIdFromUrl(b.youtube_url)
        const statsA = videoIdA ? videoStats[videoIdA] : null
        const statsB = videoIdB ? videoStats[videoIdB] : null
        
        if (statsA && statsB) {
          return statsB.publishedAt.getTime() - statsA.publishedAt.getTime()
        }
      }
      
      // Pokud jedno nemá video, řadíme ho na konec
      if (!a.youtube_url) return 1
      if (!b.youtube_url) return -1
      
      // Pokud nemáme statistiky, použijeme datum vytvoření puzzle
      return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    })

  const filteredPuzzles = relevantPuzzles?.filter(puzzle => {
    if (status === 'published') return puzzle.youtube_url
    if (status === 'unpublished') return !puzzle.youtube_url
    return true
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Spolupráce
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden mr-2">
            {(['all', 'collaboration', 'own'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setVideoType(type)}
                className={`px-4 py-2 text-sm ${
                  videoType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                {type === 'all' ? 'Všechna videa' : 
                 type === 'collaboration' ? 'Ze spolupráce' : 'Vlastní videa'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden">
            {(['all', 'published', 'unpublished'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`px-4 py-2 text-sm ${
                  status === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                {value === 'all' ? 'Vše' : 
                 value === 'published' ? 'Publikováno' : 'Nepublikováno'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!filteredPuzzles?.length ? ( 
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {videoType === 'collaboration' ? (
              status === 'published' 
                ? 'Zatím nejsou žádná publikovaná videa ze spolupráce.'
                : status === 'unpublished' 
                ? 'Vložte odkaz na YouTube video při editaci puzzle záznamu.'
                : 'Zatím nejsou žádná puzzle ze spolupráce.'
            ) : videoType === 'own' ? (
              status === 'published'
                ? 'Zatím nejsou žádná publikovaná vlastní videa.'
                : status === 'unpublished'
                ? 'Vložte odkaz na YouTube video při editaci puzzle záznamu.'
                : 'Zatím nejsou žádná vlastní videa.'
            ) : (
              status === 'published'
                ? 'Zatím nejsou žádná publikovaná videa.'
                : status === 'unpublished'
                ? 'Vložte odkaz na YouTube video při editaci puzzle záznamu.'
                : 'Zatím nejsou žádná videa.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPuzzles.map(puzzle => {
            const videoId = puzzle.youtube_url ? getVideoIdFromUrl(puzzle.youtube_url) : null
            const videoDetails = videoId ? videoStats[videoId] : null

            return (
              <div
                key={puzzle.id}
                className={`rounded-lg shadow-lg overflow-hidden ${
                  puzzle.is_collaboration ? (
                    'bg-white dark:bg-gray-800'
                  ) : (
                    'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 opacity-75'
                  )
                }`}
              >
                <div className="grid grid-cols-2 gap-6 p-6">
                  {/* Obrázek puzzle */}
                  <div className="relative aspect-video">
                    <img
                      src={puzzle.image_url}
                      alt={puzzle.name}
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      loading="lazy"
                      onClick={() => navigate('/', { state: { searchTerm: puzzle.name } })}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  {/* Náhled videa */}
                  {puzzle.youtube_url && videoId ? (
                    <a
                      href={puzzle.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video group cursor-pointer"
                    >
                      <img
                        src={getYoutubeThumbnailUrl(videoId)}
                        alt="Náhled videa"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-gray-900"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Postupně zkusíme různé kvality náhledů
                          const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];
                          const currentQuality = qualities.find(q => target.src.includes(q));
                          const nextQualityIndex = currentQuality ? qualities.indexOf(currentQuality) + 1 : 0;
                          
                          if (nextQualityIndex < qualities.length) {
                            target.src = `https://img.youtube.com/vi/${videoId}/${qualities[nextQualityIndex]}.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <Youtube className="w-12 h-12 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </a>
                  ) : (
                    <button
                      onClick={() => setSelectedPuzzle(puzzle)}
                      className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg group"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                        <Youtube className="w-12 h-12 mb-2" />
                        <span className="text-sm">Přidat video</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Informace */}
                <div className="px-6 pb-6">
                  <div
                    onClick={() => navigate('/', { state: { searchTerm: puzzle.name } })}
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 block text-left relative"
                  >
                    <div className="flex items-center">
                      <Puzzle className="w-5 h-5 mr-2" />
                      {puzzle.name}
                      {puzzle.is_collaboration && puzzle.source && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate('/', { 
                              state: { 
                                sources: [puzzle.source!.id],
                                isCollaboration: true,
                                searchTerm: ''
                              } 
                            })
                          }}
                          className="ml-2 text-sm font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer"
                        >
                          Spolupráce s {puzzle.source.name}
                        </div>
                      )}
                      {!puzzle.is_collaboration && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          Vlastní video
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {videoDetails && (
                    <a
                      href={puzzle.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 flex items-center gap-2"
                    >
                      <Youtube className="inline-block w-5 h-5 mr-2" />
                      {videoDetails.title}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {videoDetails && (
                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatNumber(videoDetails.viewCount)} zhlédnutí
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {formatNumber(videoDetails.likeCount)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {formatNumber(videoDetails.commentCount)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(videoDetails.publishedAt)}
                        </span>
                      </div>
                    )}

                    <div className="text-gray-600 dark:text-gray-400">
                      {puzzle.manufacturer} • {puzzle.pieces} dílků
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal
        isOpen={!!selectedPuzzle}
        onClose={() => setSelectedPuzzle(undefined)}
        title="Přidat video"
      >
        {selectedPuzzle && (
          <YouTubeModal
            puzzle={selectedPuzzle}
            onClose={() => setSelectedPuzzle(undefined)}
          />
        )}
      </Modal>
    </div>
  )
}