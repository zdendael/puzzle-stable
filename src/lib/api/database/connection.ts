import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../../config'
import { ConnectionError } from './errors'
import { retryOperation } from './retry'

let supabaseInstance: SupabaseClient | null = null
let connectionAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 2000
const CONNECTION_TIMEOUT = 60000

export async function getSupabaseClient() {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        },
        global: {
          headers: { 'x-custom-timeout': CONNECTION_TIMEOUT.toString() }
        },
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      })
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      throw new ConnectionError('Failed to create database connection', error as Error)
    }
  }

  try {
    // Test připojení s retry logikou
    await retryOperation(
      async () => {
        const { data, error: pingError } = await supabaseInstance!
          .from('puzzles')
          .select('id', { count: 'exact', head: true })
          .limit(1)
          .maybeSingle()

        if (pingError) throw pingError
      },
      MAX_RECONNECT_ATTEMPTS,
      CONNECTION_TIMEOUT
    )

    // Reset počtu pokusů při úspěšném připojení
    connectionAttempts = 0
    return supabaseInstance
  } catch (error) {
    console.error('Connection test failed:', error)
    
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      supabaseInstance = null
      connectionAttempts = 0
      throw new ConnectionError('Maximum connection attempts reached', error as Error)
    }

    connectionAttempts++
    console.log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY * connectionAttempts))
    
    // Reset instance a zkusit znovu
    supabaseInstance = null
    return getSupabaseClient()
  }
}

export function resetConnection() {
  supabaseInstance = null
  connectionAttempts = 0
}

export function scheduleReconnect() {
  setTimeout(resetConnection, 5000)
}