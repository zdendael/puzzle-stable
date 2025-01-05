import { getSupabaseClient } from './connection'
import { DatabaseError } from './errors'
import { retryOperation } from './retry'

export async function updatePuzzleTags(puzzleId: number, tagNames: string[]) {
  try {
    const supabase = await getSupabaseClient()
    
    await retryOperation(() => supabase.from('puzzle_tags').delete().eq('puzzle_id', puzzleId))
    
    if (tagNames.length > 0) {
      const { data: tags, error: tagsError } = await retryOperation(() =>
        supabase
          .from('tags')
          .select('id, name')
          .in('name', tagNames)
      )

      if (tagsError || !tags) {
        throw new DatabaseError('Chyba při načítání štítků')
      }

      const tagLinks = tags.map(tag => ({
        puzzle_id: puzzleId,
        tag_id: tag.id
      }))

      const { error: linkError } = await retryOperation(() =>
        supabase
          .from('puzzle_tags')
          .insert(tagLinks)
      )

      if (linkError) {
        throw new DatabaseError('Chyba při přiřazování štítků')
      }
    }
  } catch (error) {
    throw error instanceof DatabaseError ? error : new DatabaseError('Chyba při aktualizaci štítků', error as Error)
  }
}

export async function updatePuzzleCategories(puzzleId: number, categoryNames: string[]) {
  try {
    const supabase = await getSupabaseClient()
    
    await retryOperation(() => supabase.from('puzzle_categories').delete().eq('puzzle_id', puzzleId))
    
    if (categoryNames.length > 0) {
      const { data: categories, error: categoriesError } = await retryOperation(() =>
        supabase
          .from('categories')
          .select('id, name')
          .in('name', categoryNames)
      )

      if (categoriesError || !categories) {
        throw new DatabaseError('Chyba při načítání kategorií')
      }

      const categoryLinks = categories.map(category => ({
        puzzle_id: puzzleId,
        category_id: category.id
      }))

      const { error: linkError } = await retryOperation(() =>
        supabase
          .from('puzzle_categories')
          .insert(categoryLinks)
      )

      if (linkError) {
        throw new DatabaseError('Chyba při přiřazování kategorií')
      }
    }
  } catch (error) {
    throw error instanceof DatabaseError ? error : new DatabaseError('Chyba při aktualizaci kategorií', error as Error)
  }
}