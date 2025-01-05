import { getSupabaseClient } from './connection'
import { DatabaseError, QueryError, ValidationError } from './errors'
import { retryOperation } from './retry'
import type { Puzzle } from '../../types'

export async function fetchPuzzles() {
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await retryOperation(async () => {
      const result = await supabase
        .from('puzzles')
        .select(`
          *,
          manufacturer:manufacturers(name, country_code),
          source:sources(*),
          puzzle_tags(
            tag:tags(name)
          ),
          puzzle_categories(
            category:categories(name)
          ),
          sessions:puzzle_sessions(*),
          edition:editions(name)
        `)
        .order('created_at', { ascending: false })

      if (result.error) {
        throw new QueryError('Failed to fetch puzzles', result.error)
      }

      return result
    })

    if (error) {
      throw error
    }

    if (!data) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error in fetchPuzzles:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch puzzles', error as Error)
  }
}

export async function insertPuzzle(puzzle: Partial<Puzzle>) {
  try {
    if (!puzzle.name?.trim()) {
      throw new ValidationError('Název puzzle je povinný')
    }

    if (!puzzle.manufacturer) {
      throw new ValidationError('Výrobce je povinný')
    }

    if (!puzzle.pieces || puzzle.pieces <= 0) {
      throw new ValidationError('Počet dílků musí být větší než 0')
    }

    const supabase = await getSupabaseClient()

    // Get manufacturer ID
    const { data: manufacturerData, error: manufacturerError } = await retryOperation(() =>
      supabase
        .from('manufacturers')
        .select('id')
        .eq('name', puzzle.manufacturer)
        .single()
    )

    if (manufacturerError || !manufacturerData) {
      throw new ValidationError('Výrobce nebyl nalezen')
    }

    const puzzleData = {
      name: puzzle.name,
      manufacturer_id: manufacturerData.id,
      pieces: puzzle.pieces,
      missing_pieces: puzzle.missing_pieces || 0,
      difficulty: puzzle.difficulty || 'unrated',
      image_url: puzzle.image_url,
      acquisition_date: puzzle.acquisition_date?.toISOString().split('T')[0],
      removal_date: puzzle.removal_date?.toISOString().split('T')[0],
      purchase_date: puzzle.purchase_date?.toISOString().split('T')[0],
      price: puzzle.price || 0,
      is_gift: puzzle.is_gift || false,
      is_collaboration: puzzle.is_collaboration || false,
      is_own_purchase: puzzle.is_own_purchase || false,
      in_collection: puzzle.in_collection ?? true,
      notes: puzzle.notes || null,
      rating: puzzle.rating,
      source_id: puzzle.source?.id,
      edition_id: puzzle.edition_id
    }

    const { data: newPuzzle, error: puzzleError } = await retryOperation(() =>
      puzzle.id
        ? supabase.from('puzzles').update(puzzleData).eq('id', puzzle.id).select().single()
        : supabase.from('puzzles').insert(puzzleData).select().single()
    )

    if (puzzleError || !newPuzzle) {
      throw new DatabaseError('Failed to save puzzle', puzzleError)
    }

    return newPuzzle
  } catch (error) {
    console.error('Error in insertPuzzle:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to save puzzle', error as Error)
  }
}

export async function removePuzzle(id: number) {
  try {
    const supabase = await getSupabaseClient()

    const { error } = await retryOperation(() =>
      supabase.from('puzzles').delete().eq('id', id)
    )

    if (error) {
      throw new DatabaseError('Failed to delete puzzle', error)
    }
  } catch (error) {
    console.error('Error in removePuzzle:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to delete puzzle', error as Error)
  }
}