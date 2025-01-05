import { supabase } from '../supabase'
import type { Puzzle } from '../types'
import { DatabaseError } from './database/errors'
import { retryOperation } from './database/retry'
import toast from 'react-hot-toast'

export async function getPuzzles() {
  let retryCount = 0;
  const maxRetries = 3;

  async function attemptFetch() {
    try {
      const { data, error } = await retryOperation(async () => {
      return await supabase
        .from('puzzles')
        .select(`
          id,
          name,
          manufacturer:manufacturers(name, country_code),
          pieces,
          missing_pieces,
          difficulty,
          image_url,
          acquisition_date,
          removal_date,
          purchase_date,
          price,
          is_gift,
          is_collaboration, 
          is_own_purchase,
          in_collection,
          notes,
          rating,
          created_at,
          youtube_url,
          source:sources(id, name, type, url),
          edition:editions(id, name),
          puzzle_tags(tag:tags(name)),
          puzzle_categories(category:categories(name)),
          sessions:puzzle_sessions(id, start_date, end_date, duration_minutes, notes, created_at)
        `)
        .order('created_at', { ascending: false })
    })
      
    if (error) {
      throw new DatabaseError('Failed to fetch puzzles', error)
    }
    
      return (data || []).map(puzzle => ({
      id: puzzle.id,
      name: puzzle.name,
      manufacturer: puzzle.manufacturer?.name,
      manufacturerCountryCode: puzzle.manufacturer?.country_code,
      pieces: puzzle.pieces,
      missing_pieces: puzzle.missing_pieces || 0,
      difficulty: puzzle.difficulty,
      categories: puzzle.puzzle_categories?.map(pc => pc.category?.name).filter(Boolean) || [],
      image_url: puzzle.image_url,
      acquisition_date: puzzle.acquisition_date ? new Date(puzzle.acquisition_date) : new Date(),
      removal_date: puzzle.removal_date ? new Date(puzzle.removal_date) : null,
      purchase_date: puzzle.purchase_date ? new Date(puzzle.purchase_date) : null,
      price: puzzle.price || 0,
      is_gift: puzzle.is_gift || false,
      is_collaboration: puzzle.is_collaboration || false,
      is_own_purchase: puzzle.is_own_purchase || false,
      in_collection: puzzle.in_collection ?? true,
      notes: puzzle.notes || '',
      tags: puzzle.puzzle_tags?.map(pt => pt.tag?.name).filter(Boolean) || [],
      rating: puzzle.rating || null,
      created_at: puzzle.created_at ? new Date(puzzle.created_at) : new Date(),
      source: puzzle.source || null,
      youtube_url: puzzle.youtube_url || null,
      edition_id: puzzle.edition?.id || null,
      edition: puzzle.edition?.name || null,
      sessions: (puzzle.sessions || [])
        .map(session => ({
          ...session,
          start_date: new Date(session.start_date),
          end_date: session.end_date ? new Date(session.end_date) : null,
          created_at: new Date(session.created_at)
        })),
      from_wishlist: puzzle.from_wishlist || false,
      deleted_at: puzzle.deleted_at ? new Date(puzzle.deleted_at) : null,
      rating_date: puzzle.rating_date ? new Date(puzzle.rating_date) : null,
      previous_rating: puzzle.previous_rating || null,
      last_modified: puzzle.last_modified ? new Date(puzzle.last_modified) : null,
      modified_fields: puzzle.modified_fields || []
    }))
    } catch (error) {
      console.error(`Attempt ${retryCount + 1}/${maxRetries} failed:`, error)
      if (retryCount < maxRetries - 1) {
        retryCount++
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        return attemptFetch()
      }
      throw error
    }
  }

  return attemptFetch()
}

export async function createPuzzle(puzzle: Omit<Puzzle, 'id'>) {
  try {
    const { data: manufacturerData, error: manufacturerError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', puzzle.manufacturer)
      .single()
    
    if (manufacturerError) throw manufacturerError
    if (!manufacturerData) throw new Error('Výrobce nebyl nalezen')

    // Validace YouTube URL
    if (puzzle.youtube_url && !/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+$/.test(puzzle.youtube_url)) {
      throw new Error('Neplatný formát YouTube URL')
    }

    const { data: newPuzzle, error: puzzleError } = await supabase
      .from('puzzles')
      .insert({
        name: puzzle.name,
        manufacturer_id: manufacturerData.id,
        pieces: puzzle.pieces,
        missing_pieces: puzzle.missing_pieces,
        difficulty: puzzle.difficulty,
        image_url: puzzle.image_url,
        acquisition_date: puzzle.acquisition_date?.toISOString().split('T')[0],
        removal_date: puzzle.removal_date?.toISOString().split('T')[0],
        purchase_date: puzzle.purchase_date?.toISOString().split('T')[0],
        price: puzzle.price,
        is_gift: puzzle.is_gift,
        is_collaboration: puzzle.is_collaboration,
        is_own_purchase: puzzle.is_own_purchase,
        in_collection: puzzle.in_collection,
        notes: puzzle.notes,
        rating: puzzle.rating,
        source_id: puzzle.source?.id,
        edition_id: puzzle.edition_id
      })
      .select()
      .single()
    
    if (puzzleError) throw puzzleError

    if (puzzle.tags.length > 0) {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', puzzle.tags)

      if (tags) {
        const tagLinks = tags.map(tag => ({
          puzzle_id: newPuzzle.id,
          tag_id: tag.id
        }))

        const { error: tagError } = await supabase
          .from('puzzle_tags')
          .insert(tagLinks)

        if (tagError) throw tagError
      }
    }

    if (puzzle.categories.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', puzzle.categories)

      if (categories) {
        const categoryLinks = categories.map(category => ({
          puzzle_id: newPuzzle.id,
          category_id: category.id
        }))

        const { error: categoryError } = await supabase
          .from('puzzle_categories')
          .insert(categoryLinks)

        if (categoryError) throw categoryError
      }
    }

    return getPuzzles().then(data => data.find(p => p.id === newPuzzle.id))
  } catch (error) {
    console.error('Error in createPuzzle:', error)
    toast.error('Nepodařilo se vytvořit puzzle')
    throw error
  }
}

export async function updatePuzzle(id: number, puzzle: Omit<Puzzle, 'id'>) {
  try {
    const { data: manufacturerData, error: manufacturerError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', puzzle.manufacturer)
      .single()
    
    if (manufacturerError) throw manufacturerError
    if (!manufacturerData) throw new Error('Výrobce nebyl nalezen')

    const { error: puzzleError } = await supabase
      .from('puzzles')
      .update({
        name: puzzle.name,
        manufacturer_id: manufacturerData.id,
        pieces: puzzle.pieces,
        missing_pieces: puzzle.missing_pieces,
        youtube_url: puzzle.youtube_url?.trim() || null,
        difficulty: puzzle.difficulty,
        image_url: puzzle.image_url,
        acquisition_date: puzzle.acquisition_date?.toISOString().split('T')[0],
        purchase_date: puzzle.purchase_date?.toISOString().split('T')[0],
        price: puzzle.price,
        is_gift: puzzle.is_gift,
        is_collaboration: puzzle.is_collaboration,
        is_own_purchase: puzzle.is_own_purchase,
        in_collection: puzzle.in_collection,
        notes: puzzle.notes,
        rating: puzzle.rating,
        source_id: puzzle.source?.id,
        edition_id: puzzle.edition_id
      })
      .eq('id', id)
    
    if (puzzleError) throw puzzleError

    await supabase.from('puzzle_tags').delete().eq('puzzle_id', id)
    if (puzzle.tags.length > 0) {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', puzzle.tags)

      if (tags) {
        const tagLinks = tags.map(tag => ({
          puzzle_id: id,
          tag_id: tag.id
        }))

        const { error: tagError } = await supabase
          .from('puzzle_tags')
          .insert(tagLinks)

        if (tagError) throw tagError
      }
    }

    await supabase.from('puzzle_categories').delete().eq('puzzle_id', id)
    if (puzzle.categories.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', puzzle.categories)

      if (categories) {
        const categoryLinks = categories.map(category => ({
          puzzle_id: id,
          category_id: category.id
        }))

        const { error: categoryError } = await supabase
          .from('puzzle_categories')
          .insert(categoryLinks)

        if (categoryError) throw categoryError
      }
    }
  } catch (error) {
    console.error('Error in updatePuzzle:', error)
    toast.error('Nepodařilo se aktualizovat puzzle')
    throw error
  }
}

export async function deletePuzzle(id: number) {
  try {
    const { error } = await supabase
      .from('puzzles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Error in deletePuzzle:', error)
    toast.error('Nepodařilo se smazat puzzle')
    throw error
  }
}