import { getSupabaseClient, resetConnection, scheduleReconnect } from './connection'
import { DatabaseError, ConnectionError, QueryError, ValidationError } from './errors'
import { retryOperation } from './retry'
import { fetchPuzzles, insertPuzzle, removePuzzle } from './puzzles'
import { updatePuzzleTags, updatePuzzleCategories } from './relations'

export {
  // Core database functionality
  getSupabaseClient,
  resetConnection,
  scheduleReconnect,
  retryOperation,
  
  // Error types
  DatabaseError,
  ConnectionError,
  QueryError,
  ValidationError,
  
  // Puzzle operations
  fetchPuzzles,
  insertPuzzle,
  removePuzzle,
  
  // Relation operations
  updatePuzzleTags,
  updatePuzzleCategories
}