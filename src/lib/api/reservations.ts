import { supabase } from '../supabase'

export async function createReservation(wishlistId: number, name: string) {
  try {
    // Nejprve zkontrolujeme, zda položka již není rezervovaná
    const { data: existingReservation } = await supabase
      .from('wishlist_reservations')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .single()

    if (existingReservation) {
      throw new Error('Toto puzzle je již rezervované')
    }

    const { data, error } = await supabase
      .from('wishlist_reservations')
      .insert({
        wishlist_id: wishlistId,
        reserver_name: name.trim()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Chyba při vytváření rezervace:', error)
    throw error instanceof Error ? error : new Error('Nepodařilo se vytvořit rezervaci')
  }
}

export async function deleteReservation(id: number) {
  const { error } = await supabase
    .from('wishlist_reservations')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}