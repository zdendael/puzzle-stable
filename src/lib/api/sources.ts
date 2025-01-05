import { supabase } from '../supabase'
import type { Source } from '../types'
import { DatabaseError } from './database/errors'
import { retryOperation } from './database/retry'
import { queryClient } from '../queryClient'
import toast from 'react-hot-toast'

export async function getSources() {
  try {
    const { data: sources, error: sourcesError } = await retryOperation(async () => {
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .order('name')
      
      if (sourcesError) {
        throw new DatabaseError('Nepodařilo se načíst seznam zdrojů', sourcesError)
      }

      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('puzzles')
        .select(`
          source_id,
          is_collaboration
        `)
        .not('source_id', 'is', null)
      
      if (puzzlesError) {
        throw new DatabaseError('Nepodařilo se načíst statistiky zdrojů', puzzlesError)
      }

      // Calculate counts manually
      const puzzleCounts = (puzzlesData || []).reduce((acc, puzzle) => {
        if (!puzzle.source_id) return acc
        
        if (!acc[puzzle.source_id]) {
          acc[puzzle.source_id] = { total: 0, collaboration: 0 }
        }
        
        acc[puzzle.source_id].total++
        if (puzzle.is_collaboration) {
          acc[puzzle.source_id].collaboration++
        }
        
        return acc
      }, {} as Record<number, { total: number; collaboration: number }>)
      
      
      return {
        data: sourcesData?.map(source => ({
          ...source,
          puzzleCount: puzzleCounts[source.id]?.total || 0,
          collaborationCount: puzzleCounts[source.id]?.collaboration || 0
        }))
      }
    })
    
    if (sourcesError) throw sourcesError

    return (sources || []).map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      url: source.url,
      address: source.address,
      isCollaboration: source.is_collaboration,
      collaborationStart: source.collaboration_start,
      collaborationEnd: source.collaboration_end,
      puzzleCount: source.puzzleCount || 0,
      collaborationCount: source.collaborationCount || 0
    }))
  } catch (error) {
    console.error('Error in getSources:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Nepodařilo se načíst data', error as Error)
  }
}

export async function createSource(source: Omit<Source, 'id'>) {
  try {
    const { data, error } = await retryOperation(async () => {
      return await supabase
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
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in createSource:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to create source', error as Error)
  }
}

export async function updateSource(id: number, source: Omit<Source, 'id'>) {
  try {
    const { error } = await retryOperation(async () => {
      return await supabase
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
    })
    
    if (error) throw error

    // Invalidate cache for sources
    queryClient.invalidateQueries({ queryKey: ['sources'] })
  } catch (error) {
    console.error('Error in updateSource:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to update source', error as Error)
  }
}

export async function deleteSource(id: number) {
  try {
    // First check for linked puzzles
    const { data: linkedPuzzles, error: checkError } = await retryOperation(async () => {
      return await supabase
        .from('puzzles')
        .select('id, name, is_collaboration')
        .eq('source_id', id)
    })

    if (checkError) throw checkError
    
    if (linkedPuzzles && linkedPuzzles.length > 0) {
      const collaborationCount = linkedPuzzles.filter(p => p.is_collaboration).length
      const normalCount = linkedPuzzles.length - collaborationCount
      
      let message = `Tento zdroj nelze smazat, protože je použit u ${linkedPuzzles.length} puzzlí:\n\n`
      
      if (normalCount > 0) {
        message += `${normalCount} běžných puzzlí:\n`
        linkedPuzzles
          .filter(p => !p.is_collaboration)
          .forEach(p => message += `• ${p.name}\n`)
        message += '\n'
      }
      
      if (collaborationCount > 0) {
        message += `${collaborationCount} puzzlí ze spolupráce:\n`
        linkedPuzzles
          .filter(p => p.is_collaboration)
          .forEach(p => message += `• ${p.name}\n`)
      }
      
      message += '\nNejprve odeberte zdroj ze všech puzzlí.'
      throw new Error(message)
    }

    const { error } = await retryOperation(async () => {
      return await supabase
        .from('sources')
        .delete()
        .eq('id', id)
    })
    
    if (error) throw error

    // Invalidate cache for sources
    queryClient.invalidateQueries({ queryKey: ['sources'] })
  } catch (error) {
    console.error('Error in deleteSource:', error)
    throw error instanceof DatabaseError ? error : new DatabaseError('Failed to delete source', error as Error)
  }
}