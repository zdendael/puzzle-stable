import { supabase } from '../supabase'
import type { Edition } from '../types'

export async function getEditions() {
  const { data, error } = await supabase
    .from('editions')
    .select(`
      *,
      manufacturer:manufacturers(name),
      puzzles (
        count
      )
    `)
    .order('name')
  
  if (error) throw error
  return data.map(edition => ({
    id: edition.id,
    name: edition.name,
    manufacturer_id: edition.manufacturer_id,
    manufacturer: edition.manufacturer?.name,
    puzzleCount: edition.puzzles?.[0]?.count || 0,
    created_at: edition.created_at ? new Date(edition.created_at) : undefined
  }))
}

export async function getEditionsByManufacturer(manufacturerId: number) {
  const { data, error } = await supabase
    .from('editions')
    .select(`
      *,
      manufacturer:manufacturers(name),
      puzzles (
        count
      )
    `)
    .eq('manufacturer_id', manufacturerId)
    .order('name')
  
  if (error) throw error
  return data.map(edition => ({
    id: edition.id,
    name: edition.name,
    manufacturer_id: edition.manufacturer_id,
    manufacturer: edition.manufacturer?.name,
    puzzleCount: edition.puzzles?.[0]?.count || 0,
    created_at: edition.created_at ? new Date(edition.created_at) : undefined
  }))
}

export async function createEdition(edition: Omit<Edition, 'id'>) {
  const { data, error } = await supabase
    .from('editions')
    .insert({
      name: edition.name,
      manufacturer_id: edition.manufacturer_id
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating edition:', error)
    throw new Error('Nepodařilo se vytvořit edici')
  }
  return data
}

export async function updateEdition(id: number, edition: Omit<Edition, 'id'>) {
  const { error } = await supabase
    .from('editions')
    .update({
      name: edition.name,
      manufacturer_id: edition.manufacturer_id
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating edition:', error)
    throw new Error('Nepodařilo se upravit edici')
  }
}

export async function deleteEdition(id: number) {
  // Nejprve zkontrolujeme, zda existují propojená puzzle
  const { data: linkedPuzzles, error: checkError } = await supabase
    .from('puzzles')
    .select('id')
    .eq('edition_id', id)

  if (checkError) {
    console.error('Error checking linked puzzles:', checkError)
    throw new Error('Nepodařilo se ověřit propojená puzzle')
  }
  
  if (linkedPuzzles && linkedPuzzles.length > 0) {
    throw new Error(`Tuto edici nelze smazat, protože obsahuje ${linkedPuzzles.length} puzzlí. Nejprve odeberte všechna puzzle z této edice.`)
  }

  const { error } = await supabase
    .from('editions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting edition:', error)
    throw new Error('Nepodařilo se smazat edici')
  }
}