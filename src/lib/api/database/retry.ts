import { PostgrestError } from '@supabase/supabase-js'
import { DatabaseError, ConnectionError } from './errors'

const DEFAULT_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
  maxDelay: 30000,
  timeout: 15000
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = DEFAULT_OPTIONS.maxRetries,
  timeout = DEFAULT_OPTIONS.timeout
): Promise<T> {
  let lastError: Error | PostgrestError | null = null
  let delay = DEFAULT_OPTIONS.retryDelay
  let currentAttempt = 0

  while (currentAttempt < maxRetries) {
    try {
      if (currentAttempt > 0) {
        console.log(`Pokus o připojení ${currentAttempt + 1}/${maxRetries}...`)
      }
      
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ])
      
      return result
    } catch (error) {
      lastError = error as Error | PostgrestError
      
      if (error instanceof Error && error.message === 'Timeout') {
        console.error('Připojení vypršelo')
        throw new ConnectionError('Připojení vypršelo', error)
      }
      
      console.error(`Pokus ${currentAttempt + 1} selhal:`, error)
      currentAttempt++
      
      if (currentAttempt < maxRetries) {
        const jitter = Math.random() * 500
        await new Promise(resolve => setTimeout(resolve, delay + jitter))
        delay = Math.min(delay * 2, DEFAULT_OPTIONS.maxDelay)
        continue
      }
    }
  }

  throw lastError instanceof DatabaseError 
    ? lastError 
    : new ConnectionError(
        'Nepodařilo se připojit k databázi',
        lastError,
        false
      )
}