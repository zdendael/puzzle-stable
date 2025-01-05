import { supabase } from './supabase'
import type { Manufacturer, Puzzle, Tag, Category, Source, PuzzleSession, WishListItem } from './types'

// Manufacturers
export async function getManufacturers() {
  const { data, error } = await supabase
    .from('manufacturers')
    .select(`
      *,
      puzzles (
        count
      )
    `)
    .order('name')
  
  if (error) throw error
  return data.map(m => ({
    id: m.id,
    name: m.name,
    country: m.country,
    countryCode: m.country_code,
    puzzleCount: m.puzzles?.[0]?.count || 0
  }))
}

export async function createManufacturer(manufacturer: Omit<Manufacturer, 'id'>) {
  const { data, error } = await supabase
    .from('manufacturers')
    .insert({
      name: manufacturer.name,
      country: manufacturer.country,
      country_code: manufacturer.countryCode
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateManufacturer(id: number, manufacturer: Omit<Manufacturer, 'id'>) {
  const { error } = await supabase
    .from('manufacturers')
    .update({
      name: manufacturer.name,
      country: manufacturer.country,
      country_code: manufacturer.countryCode
    })
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteManufacturer(id: number) {
  const { error } = await supabase
    .from('manufacturers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Tags
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
  
  if (error) throw error
  return data
}

export async function updateTag(id: number, tag: Omit<Tag, 'id'>) {
  const { error } = await supabase
    .from('tags')
    .update(tag)
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteTag(id: number) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Categories
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
  
  if (error) throw error
  return data
}

export async function updateCategory(id: number, category: Omit<Category, 'id'>) {
  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteCategory(id: number) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Sources
export async function getSources() {
  const { data, error } = await supabase
    .from('sources')
    .select(`
      *,
      puzzles (
        count,
        is_collaboration
      )
    `)
    .order('name')
  
  if (error) throw error
  return data.map(source => ({
    id: source.id,
    name: source.name,
    type: source.type,
    url: source.url,
    address: source.address,
    isCollaboration: source.is_collaboration,
    collaborationStart: source.collaboration_start,
    collaborationEnd: source.collaboration_end,
    puzzleCount: source.puzzles?.[0]?.count || 0,
    collaborationCount: source.puzzles?.filter((p: any) => p.is_collaboration).length || 0
  }))
}

export async function createSource(source: Omit<Source, 'id'>) {
  const { data, error } = await supabase
    .from('sources')
    .insert({
      name: source.name,
      type: source.type,
      url: source.url,
      address: source.address,
      is_collaboration: source.isCollaboration,
      collaboration_start: source.collaborationStart || null,
      collaboration_end: source.collaborationEnd || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateSource(id: number, source: Omit<Source, 'id'>) {
  const { error } = await supabase
    .from('sources')
    .update({
      name: source.name,
      type: source.type,
      url: source.url,
      address: source.address,
      is_collaboration: source.isCollaboration,
      collaboration_start: source.collaborationStart || null,
      collaboration_end: source.collaborationEnd || null
    })
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteSource(id: number) {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Puzzles
export async function getPuzzles() {
  const { data: puzzles, error: puzzlesError } = await supabase
    .from('puzzles')
    .select(`
      *,
      manufacturer:manufacturers(name),
      source:sources(*),
      puzzle_tags(
        tag:tags(name)
      ),
      puzzle_categories(
        category:categories(name)
      ),
      sessions:puzzle_sessions(*)
    `)
    .order('created_at', { ascending: false })
  
  if (puzzlesError) throw puzzlesError

  return puzzles.map(puzzle => ({
    id: puzzle.id,
    name: puzzle.name,
    manufacturer: puzzle.manufacturer?.name,
    pieces: puzzle.pieces,
    missing_pieces: puzzle.missing_pieces || 0,
    difficulty: puzzle.difficulty,
    categories: puzzle.puzzle_categories.map(pc => pc.category.name),
    image_url: puzzle.image_url,
    acquisition_date: puzzle.acquisition_date ? new Date(puzzle.acquisition_date) : null,
    removal_date: puzzle.removal_date ? new Date(puzzle.removal_date) : null,
    purchase_date: puzzle.purchase_date ? new Date(puzzle.purchase_date) : null,
    price: puzzle.price,
    is_gift: puzzle.is_gift,
    is_collaboration: puzzle.is_collaboration,
    is_own_purchase: puzzle.is_own_purchase,
    in_collection: puzzle.in_collection,
    notes: puzzle.notes,
    tags: puzzle.puzzle_tags.map(pt => pt.tag.name),
    rating: puzzle.rating,
    created_at: puzzle.created_at ? new Date(puzzle.created_at) : undefined,
    source: puzzle.source,
    sessions: puzzle.sessions?.map(session => ({
      ...session,
      start_date: new Date(session.start_date),
      end_date: session.end_date ? new Date(session.end_date) : null,
      created_at: new Date(session.created_at)
    })).sort((a, b) => b.start_date.getTime() - a.start_date.getTime()),
    from_wishlist: puzzle.from_wishlist,
    deleted_at: puzzle.deleted_at ? new Date(puzzle.deleted_at) : undefined,
    rating_date: puzzle.rating_date ? new Date(puzzle.rating_date) : undefined,
    previous_rating: puzzle.previous_rating,
    last_modified: puzzle.last_modified ? new Date(puzzle.last_modified) : undefined,
    modified_fields: puzzle.modified_fields
  }))
}

export async function createPuzzle(puzzle: Omit<Puzzle, 'id'>) {
  try {
    if (puzzle.pieces <= 0) {
      throw new Error('Počet dílků musí být větší než 0')
    }

    const { data: manufacturerData, error: manufacturerError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', puzzle.manufacturer)
      .single()
    
    if (manufacturerError) throw manufacturerError
    if (!manufacturerData) throw new Error('Výrobce nebyl nalezen')

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
        source_id: puzzle.source?.id
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

    return getPuzzles().then(puzzles => puzzles.find(p => p.id === newPuzzle.id))
  } catch (error) {
    console.error('Chyba při vytváření puzzle:', error)
    throw error
  }
}

export async function updatePuzzle(id: number, puzzle: Omit<Puzzle, 'id'>) {
  try {
    if (puzzle.pieces <= 0) {
      throw new Error('Počet dílků musí být větší než 0')
    }

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
        source_id: puzzle.source?.id
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
    console.error('Chyba při ukládání:', error)
    throw error
  }
}

export async function deletePuzzle(id: number) {
  const { error } = await supabase
    .from('puzzles')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Sessions
export async function createPuzzleSession(session: Omit<PuzzleSession, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('puzzle_sessions')
    .insert({
      puzzle_id: session.puzzle_id,
      start_date: session.start_date.toISOString(),
      end_date: session.end_date ? session.end_date.toISOString() : null,
      duration_minutes: session.duration_minutes,
      notes: session.notes || null
    })
    .select()
    .single()
  
  if (error) {
    console.error('Chyba při vytváření session:', error)
    throw error
  }

  return {
    ...data,
    start_date: new Date(data.start_date),
    end_date: data.end_date ? new Date(data.end_date) : null,
    created_at: new Date(data.created_at)
  }
}

export async function updatePuzzleSession(id: number, session: Partial<Omit<PuzzleSession, 'id' | 'created_at'>>) {
  const updateData: any = {}
  
  if (session.start_date) {
    updateData.start_date = session.start_date.toISOString()
  }
  if (session.end_date) {
    updateData.end_date = session.end_date.toISOString()
  } else if (session.end_date === null) {
    updateData.end_date = null
  }
  if (typeof session.duration_minutes !== 'undefined') {
    updateData.duration_minutes = session.duration_minutes
  }
  if (typeof session.notes !== 'undefined') {
    updateData.notes = session.notes || null
  }

  const { error } = await supabase
    .from('puzzle_sessions')
    .update(updateData)
    .eq('id', id)
  
  if (error) {
    console.error('Chyba při aktualizaci session:', error)
    throw error
  }
}

export async function deletePuzzleSession(id: number) {
  const { error } = await supabase
    .from('puzzle_sessions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Chyba při mazání session:', error)
    throw error
  }
}

// Wishlist
export async function getWishList() {
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      *,
      manufacturer:manufacturers(name),
      source:sources(*),
      wishlist_tags(
        tag:tags(name)
      ),
      wishlist_categories(
        category:categories(name)
      )
    `)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) throw error

  return data.map(item => ({
    id: item.id,
    name: item.name,
    manufacturer: item.manufacturer?.name,
    pieces: item.pieces,
    categories: item.wishlist_categories.map(wc => wc.category.name),
    image_url: item.image_url,
    price: item.price,
    source: item.source,
    url: item.url,
    in_stock: item.in_stock,
    notes: item.notes,
    tags: item.wishlist_tags.map(wt => wt.tag.name),
    priority: item.priority || 'medium',
    created_at: item.created_at ? new Date(item.created_at) : undefined,
    deleted_at: item.deleted_at ? new Date(item.deleted_at) : undefined
  }))
}

export async function createWishListItem(item: Omit<WishListItem, 'id'>) {
  try {
    const { data: manufacturerData } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', item.manufacturer)
      .single()

    if (!manufacturerData) throw new Error('Výrobce nebyl nalezen')

    const { data: newItem, error: itemError } = await supabase
      .from('wishlist')
      .insert({
        name: item.name,
        manufacturer_id: manufacturerData.id,
        pieces: item.pieces,
        image_url: item.image_url,
        price: item.price,
        source_id: item.source?.id,
        url: item.url,
        in_stock: item.in_stock,
        notes: item.notes,
        priority: item.priority
      })
      .select()
      .single()

    if (itemError) throw itemError

    if (item.tags.length > 0) {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', item.tags)

      if (tags) {
        const tagLinks = tags.map(tag => ({
          wishlist_id: newItem.id,
          tag_id: tag.id
        }))

        const { error: tagError } = await supabase
          .from('wishlist_tags')
          .insert(tagLinks)

        if (tagError) throw tagError
      }
    }

    if (item.categories.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', item.categories)

      if (categories) {
        const categoryLinks = categories.map(category => ({
          wishlist_id: newItem.id,
          category_id: category.id
        }))

        const { error: categoryError } = await supabase
          .from('wishlist_categories')
          .insert(categoryLinks)

        if (categoryError) throw categoryError
      }
    }

    return getWishList().then(items => items.find(i => i.id === newItem.id))
  } catch (error) {
    console.error('Chyba při vytváření položky:', error)
    throw error
  }
}

export async function updateWishListItem(id: number, item: Omit<WishListItem, 'id'>) {
  try {
    const { data: manufacturerData } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', item.manufacturer)
      .single()

    if (!manufacturerData) throw new Error('Výrobce nebyl nalezen')

    const { error: itemError } = await supabase
      .from('wishlist')
      .update({
        name: item.name,
        manufacturer_id: manufacturerData.id,
        pieces: item.pieces,
        image_url: item.image_url,
        price: item.price,
        source_id: item.source?.id,
        url: item.url,
        in_stock: item.in_stock,
        notes: item.notes,
        priority: item.priority
      })
      .eq('id', id)

    if (itemError) throw itemError

    await supabase.from('wishlist_tags').delete().eq('wishlist_id', id)
    if (item.tags.length > 0) {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', item.tags)

      if (tags) {
        const tagLinks = tags.map(tag => ({
          wishlist_id: id,
          tag_id: tag.id
        }))

        const { error: tagError } = await supabase
          .from('wishlist_tags')
          .insert(tagLinks)

        if (tagError) throw tagError
      }
    }

    await supabase.from('wishlist_categories').delete().eq('wishlist_id', id)
    if (item.categories.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', item.categories)

      if (categories) {
        const categoryLinks = categories.map(category => ({
          wishlist_id: id,
          category_id: category.id
        }))

        const { error: categoryError } = await supabase
          .from('wishlist_categories')
          .insert(categoryLinks)

        if (categoryError) throw categoryError
      }
    }
  } catch (error) {
    console.error('Chyba při ukládání:', error)
    throw error
  }
}

export async function deleteWishListItem(id: number) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}