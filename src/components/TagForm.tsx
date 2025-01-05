import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTag, updateTag } from '../lib/api/tags'
import toast from 'react-hot-toast'
import type { Tag } from '../lib/types'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { Smile } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface TagFormProps {
  tag?: Tag
  onClose: () => void
}

export function TagForm({ tag, onClose }: TagFormProps) {
  const [form, setForm] = useState({
    name: tag?.name ?? '',
    emoji: tag?.emoji ?? '',
    color: tag?.color ?? '#6366f1'
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { isDark } = useTheme()

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (tag) {
        await updateTag(tag.id, form)
      } else {
        await createTag(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success(tag ? 'Štítek byl upraven' : 'Štítek byl přidán')
      onClose()
    },
    onError: () => {
      toast.error('Něco se pokazilo')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.emoji.trim()) {
      toast.error('Vyplňte všechna povinná pole')
      return
    }
    mutate()
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setForm({ ...form, emoji: emojiData.emoji })
    setShowEmojiPicker(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Název štítku */}
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Název štítku*
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </section>

        {/* Emoji */}
        <section className="form-section">
          <div className="form-group">
            <label className="form-label mb-2">
              Emoji*
            </label>
            <div className="relative">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {form.emoji ? (
                    <span className="text-2xl mr-2">{form.emoji}</span>
                  ) : (
                    <Smile className="w-5 h-5 mr-2 text-gray-400" />
                  )}
                  Vybrat emoji
                </button>
                
                {form.emoji && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, emoji: '' })}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Vymazat
                  </button>
                )}
              </div>
              
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2">
                  <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                  <div className="relative">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      searchPlaceholder="Hledat emoji..."
                      width={350}
                      height={400}
                      theme={isDark ? Theme.DARK : Theme.LIGHT}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Barva */}
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="color" className="form-label">
              Barva štítku
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-16 h-16 rounded-md border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <div className="flex-1">
                <div 
                  className="p-4 rounded-md text-center font-medium"
                  style={{
                    backgroundColor: `${form.color}20`,
                    color: form.color
                  }}
                >
                  {form.emoji} {form.name || 'Náhled štítku'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end space-x-2">
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
          {isPending ? 'Ukládám...' : tag ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}