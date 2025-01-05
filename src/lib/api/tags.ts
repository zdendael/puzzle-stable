import { supabase } from '../supabase'
import type { Tag } from '../types'

export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      puzzle_tags (
        count
      )
    `)
    .order('name')
  
  if (error) throw error
  return data.map(tag => ({
    id: tag.id,
    name: tag.name,
    emoji: tag.emoji,
    color: tag.color,
    puzzleCount: tag.puzzle_tags?.[0]?.count || 0
  }))
}

export async function createTag(tag: Omit<Tag, 'id'>) {
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating tag:', error)
    throw new Error('Nepodařilo se vytvořit štítek')
  }
  return data
}

export async function updateTag(id: number, tag: Omit<Tag, 'id'>) {
  const { error } = await supabase
    .from('tags')
    .update(tag)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating tag:', error)
    throw new Error('Nepodařilo se upravit štítek')
  }
}

export async function deleteTag(id: number) {
  // Nejprve zkontrolujeme, zda existují propojená puzzle
  const { data: linkedPuzzles, error: checkError } = await supabase
    .from('puzzle_tags')
    .select('puzzle_id')
    .eq('tag_id', id)

  if (checkError) {
    console.error('Error checking linked puzzles:', checkError)
    throw new Error('Nepodařilo se ověřit propojená puzzle')
  }
  
  if (linkedPuzzles && linkedPuzzles.length > 0) {
    throw new Error(`Tento štítek nelze smazat, protože je použit u ${linkedPuzzles.length} puzzlí. Nejprve odeberte štítek ze všech puzzlí.`)
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting tag:', error)
    throw new Error('Nepodařilo se smazat štítek')
  }
}