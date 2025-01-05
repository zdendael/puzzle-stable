import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '../src/utils/env'

const env = loadEnv()

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Chybí Supabase proměnné prostředí')
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

async function verifyConnection() {
  console.log('Ověřuji připojení k databázi...')
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('Není aktivní session. Prosím, přihlaste se nejdříve v aplikaci.')
      return false
    }

    const { error: pingError } = await supabase
      .from('puzzles')
      .select('count')
      .limit(1)
      .single()

    if (pingError) {
      console.error('Chyba při testování připojení:', pingError.message)
      return false
    }

    console.log('Připojení k databázi je funkční')
    return true
  } catch (error) {
    console.error('Neočekávaná chyba při ověřování připojení:', error)
    return false
  }
}

async function fixDifficultyConstraint() {
  console.log('Opravuji omezení pro difficulty...')
  
  try {
    // Nejprve odstraníme staré omezení
    await supabase.rpc('drop_difficulty_constraint')
    
    // Pak přidáme nové omezení
    await supabase.rpc('add_difficulty_constraint')
    
    console.log('Omezení pro difficulty bylo úspěšně opraveno')
    return true
  } catch (error) {
    console.error('Chyba při opravě omezení:', error)
    return false
  }
}

async function executeMigration() {
  try {
    console.log('Začínám migraci...')

    const isConnected = await verifyConnection()
    if (!isConnected) {
      throw new Error('Nelze se připojit k databázi')
    }

    const constraintFixed = await fixDifficultyConstraint()
    if (!constraintFixed) {
      throw new Error('Nepodařilo se opravit omezení pro difficulty')
    }

    console.log('Migrace byla úspěšně dokončena!')
    process.exit(0)
  } catch (error) {
    console.error('Migrace selhala:', error)
    process.exit(1)
  }
}

executeMigration()