import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory } from '../lib/api/categories'
import toast from 'react-hot-toast'
import type { Category } from '../lib/types'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { Smile } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface CategoryFormProps {
  category?: Category
  onClose: () => void
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    emoji: category?.emoji ?? ''
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { isDark } = useTheme()

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (category) {
        await updateCategory(category.id, form)
      } else {
        await createCategory(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(category ? 'Motiv byl upraven' : 'Motiv byl přidán')
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
        {/* Název motivu */}
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Název motivu*
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              required
              placeholder="Např. Krajina"
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
                <div className="fixed inset-0 z-[99999] overflow-y-auto">
                  <div className="flex min-h-screen items-center justify-center p-4">
                  <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                  <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      searchPlaceholder="Hledat emoji..."
                      width={350}
                      height={400}
                      theme={isDark ? Theme.DARK : Theme.LIGHT}
                      lazyLoadEmojis={true}
                      previewConfig={{
                        showPreview: false
                      }}
                      skinTonesDisabled={true}
                      categories={[
                        'smileys_people',
                        'animals_nature',
                        'food_drink',
                        'travel_places',
                        'activities',
                        'objects',
                        'symbols'
                      ]}
                    />
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Náhled */}
          {form.name && form.emoji && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Náhled
              </h4>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                <span className="text-lg mr-1.5">{form.emoji}</span>
                {form.name}
              </div>
            </div>
          )}
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
          {isPending ? 'Ukládám...' : category ? 'Upravit' : 'Přidat'}
        </button>
      </div>
    </form>
  )
}