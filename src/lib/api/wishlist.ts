import { supabase } from '../supabase'
import type { WishListItem } from '../types'

export async function getWishList() {
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id,
      name,
      pieces,
      image_url,
      price,
      url,
      in_stock,
      notes,
      priority,
      created_at,
      deleted_at,
      manufacturer:manufacturers(name),
      source:sources(*),
      wishlist_tags(
        tag:tags(name)
      ),
      wishlist_categories(
        category:categories(name)
      ),
      reservation:wishlist_reservations!left(id, reserver_name, created_at)
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
    deleted_at: item.deleted_at ? new Date(item.deleted_at) : undefined,
    reservation: item.reservation?.[0] ? {
      ...item.reservation[0],
      created_at: new Date(item.reservation[0].created_at)
    } : undefined
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