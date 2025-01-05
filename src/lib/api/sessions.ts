import { supabase } from '../supabase'
import type { PuzzleSession } from '../types'

export async function createPuzzleSession(session: Required<Pick<PuzzleSession, 'puzzle_id' | 'start_date'>> & Partial<PuzzleSession>) {
  // Vytvoříme ISO string s časovou zónou
  const startDate = new Date(session.start_date)
  startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset())
  const startISOString = startDate.toISOString()

  let endISOString = null
  if (session.end_date) {
    const endDate = new Date(session.end_date)
    endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset())
    endISOString = endDate.toISOString()
  }

  const { data, error } = await supabase
    .from('puzzle_sessions')
    .insert({
      puzzle_id: session.puzzle_id,
      start_date: startISOString,
      end_date: endISOString,
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
    const startDate = new Date(session.start_date)
    startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset())
    updateData.start_date = startDate.toISOString()
  }

  if (session.end_date) {
    const endDate = new Date(session.end_date)
    endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset())
    updateData.end_date = endDate.toISOString()
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