import { supabase } from '../supabase'
import type { Category } from '../types'

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      puzzle_categories (
        count
      )
    `)
    .order('name')
  
  if (error) throw error
  return data.map(category => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    puzzleCount: category.puzzle_categories?.[0]?.count || 0
  }))
}

export async function createCategory(category: Omit<Category, 'id'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating category:', error)
    throw new Error('Nepodařilo se vytvořit motiv')
  }
  return data
}

export async function updateCategory(id: number, category: Omit<Category, 'id'>) {
  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating category:', error)
    throw new Error('Nepodařilo se upravit motiv')
  }
}

export async function deleteCategory(id: number) {
  // Nejprve zkontrolujeme, zda existují propojená puzzle
  const { data: linkedPuzzles, error: checkError } = await supabase
    .from('puzzle_categories')
    .select('puzzle_id')
    .eq('category_id', id)

  if (checkError) {
    console.error('Error checking linked puzzles:', checkError)
    throw new Error('Nepodařilo se ověřit propojená puzzle')
  }
  
  if (linkedPuzzles && linkedPuzzles.length > 0) {
    throw new Error(`Tento motiv nelze smazat, protože je použit u ${linkedPuzzles.length} puzzlí. Nejprve odeberte motiv ze všech puzzlí.`)
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting category:', error)
    throw new Error('Nepodařilo se smazat motiv')
  }
}