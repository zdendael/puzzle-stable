import { createClient } from '@supabase/supabase-js'
import { config } from './config'
import toast from 'react-hot-toast'
import { DatabaseError, ConnectionError } from './api/database/errors'
import { retryOperation } from './api/database/retry'

const MAX_RETRIES = 3
const CONNECTION_TIMEOUT = 15000

// Konfigurace připojení
const CONNECTION_CONFIG = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'puzzle-collection-auth',
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: { 
      'x-custom-timeout': CONNECTION_TIMEOUT.toString(),
      'x-client-info': 'puzzle-collection@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
      timeout: Math.min(CONNECTION_TIMEOUT, 30000)
    }
  }
}

let supabaseInstance: any = null

export async function getSupabase() {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(
        config.supabase.url,
        config.supabase.anonKey,
        CONNECTION_CONFIG
      )

      // Test připojení
      await retryOperation(
        async () => {
          const { error } = await supabaseInstance
            .from('puzzles')
            .select('id', { count: 'exact', head: true })
            .limit(1)
            .maybeSingle()

          if (error) throw error
        },
        MAX_RETRIES,
        CONNECTION_TIMEOUT
      )
    } catch (error) {
      console.error('Chyba při vytváření připojení:', error)
      supabaseInstance = null
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
  return supabaseInstance
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  CONNECTION_CONFIG
)

// Test připojení při inicializaci
let connectionTestPromise = retryOperation(
  async () => {
    const { error } = await supabase
      .from('puzzles')
      .select('id', { count: 'exact', head: true })
      .limit(1)
      .maybeSingle()

    if (error) throw error
  },
  MAX_RETRIES,
  CONNECTION_TIMEOUT
).catch(error => {
  console.error('Chyba při inicializaci připojení:', error)
  if (error instanceof ConnectionError) {
    toast.error('Nepodařilo se připojit k databázi. Zkontrolujte připojení k internetu.')
  } else {
    toast.error('Nepodařilo se připojit k databázi')
  }
  throw error
})

// Event listenery pro online/offline stav
window.addEventListener('online', async () => {
  try {
    await retryOperation(
      async () => {
        const { error } = await supabase
          .from('puzzles')
          .select('id', { count: 'exact', head: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error
      },
      MAX_RETRIES,
      CONNECTION_TIMEOUT
    )
    toast.success('Připojení k internetu bylo obnoveno')
  } catch (error) {
    console.error('Chyba při obnovení připojení:', error)
    toast.error('Nepodařilo se obnovit připojení k databázi')
  }
})

window.addEventListener('offline', () => {
  toast.error('Připojení k internetu bylo ztraceno')
})

// Export promise pro čekání na připojení
export const waitForConnection = () => connectionTestPromise

export default supabase