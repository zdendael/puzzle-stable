import { PostgrestError } from '@supabase/supabase-js'

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError: Error | PostgrestError | null = null,
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'DatabaseError'
    
    // Přidání detailů chyby do message
    if (originalError instanceof Error) {
      this.message += `: ${originalError.message}`
    }
    
    // Zachování stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError)
    }
    
    // Přidání detailů chyby do message
    if (originalError instanceof Error) {
      this.message += `: ${originalError.message}`
    }
    
    // Přidání detailů chyby do message
    if (originalError instanceof Error) {
      this.message += `: ${originalError.message}`
    }
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError: Error | null = null) {
    super(message, originalError, true)
    this.name = 'ConnectionError'
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, originalError: Error | null = null) {
    super(message, originalError, true)
    this.name = 'QueryError'
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message, null, false)
    this.name = 'ValidationError'
  }
}