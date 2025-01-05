import { supabase } from '../supabase'
import type { Manufacturer } from '../types'

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
  
  if (error) {
    console.error('Error creating manufacturer:', error)
    throw new Error('Nepodařilo se vytvořit výrobce')
  }
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
  
  if (error) {
    console.error('Error updating manufacturer:', error)
    throw new Error('Nepodařilo se upravit výrobce')
  }
}

export async function deleteManufacturer(id: number) {
  // Nejprve zkontrolujeme, zda existují propojená puzzle
  const { data: linkedPuzzles, error: checkError } = await supabase
    .from('puzzles')
    .select('id')
    .eq('manufacturer_id', id)

  if (checkError) {
    console.error('Error checking linked puzzles:', checkError)
    throw new Error('Nepodařilo se ověřit propojená puzzle')
  }
  
  if (linkedPuzzles && linkedPuzzles.length > 0) {
    throw new Error(`Tohoto výrobce nelze smazat, protože má ${linkedPuzzles.length} puzzlí. Nejprve odeberte všechna puzzle tohoto výrobce.`)
  }

  const { error } = await supabase
    .from('manufacturers')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting manufacturer:', error)
    throw new Error('Nepodařilo se smazat výrobce')
  }
}