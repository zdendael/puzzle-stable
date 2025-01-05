import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { DEFAULT_MANUFACTURERS, DEFAULT_TAGS, DEFAULT_CATEGORIES } from '../src/lib/constants'

// Načteme proměnné prostředí
const env = config()
expand(env)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function initializeData() {
  try {
    console.log('Začínám inicializaci dat...')

    // Inicializace výrobců
    console.log('Importuji výrobce...')
    for (const manufacturer of DEFAULT_MANUFACTURERS) {
      const { error } = await supabase
        .from('manufacturers')
        .upsert({
          name: manufacturer.name,
          country: manufacturer.country,
          country_code: manufacturer.countryCode
        }, {
          onConflict: 'name'
        })
      
      if (error) throw error
    }

    // Inicializace štítků
    console.log('Importuji štítky...')
    for (const tag of DEFAULT_TAGS) {
      const { error } = await supabase
        .from('tags')
        .upsert({
          name: tag.name,
          emoji: tag.emoji,
          color: tag.color
        }, {
          onConflict: 'name'
        })
      
      if (error) throw error
    }

    // Inicializace kategorií
    console.log('Importuji kategorie...')
    for (const category of DEFAULT_CATEGORIES) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          name: category.name,
          emoji: category.emoji
        }, {
          onConflict: 'name'
        })
      
      if (error) throw error
    }

    // Inicializace zdrojů (e-shopy)
    console.log('Importuji e-shopy...')
    const defaultSources = [
      {
        name: 'Puzzle-eshop.cz',
        type: 'eshop',
        url: 'https://www.puzzle-eshop.cz'
      },
      {
        name: 'Puzzle-puzzle.cz',
        type: 'eshop',
        url: 'https://www.puzzle-puzzle.cz'
      },
      {
        name: 'Alza.cz',
        type: 'eshop',
        url: 'https://www.alza.cz'
      },
      {
        name: 'Mall.cz',
        type: 'eshop',
        url: 'https://www.mall.cz'
      },
      {
        name: 'CZC.cz',
        type: 'eshop',
        url: 'https://www.czc.cz'
      },
      {
        name: 'Puzzle-expert.cz',
        type: 'eshop',
        url: 'https://www.puzzle-expert.cz'
      },
      {
        name: 'Knihcentrum.cz',
        type: 'eshop',
        url: 'https://www.knihcentrum.cz'
      },
      {
        name: 'Megaknihy.cz',
        type: 'eshop',
        url: 'https://www.megaknihy.cz'
      },
      {
        name: 'Knihy Dobrovský',
        type: 'eshop',
        url: 'https://www.knihydobrovsky.cz'
      }
    ]

    for (const source of defaultSources) {
      const { error } = await supabase
        .from('sources')
        .upsert(source, {
          onConflict: 'name'
        })
      
      if (error) throw error
    }

    console.log('Data byla úspěšně inicializována!')
    process.exit(0)
  } catch (error) {
    console.error('Chyba při inicializaci dat:', error)
    process.exit(1)
  }
}

initializeData()