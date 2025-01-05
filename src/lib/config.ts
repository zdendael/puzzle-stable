const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Chybí Supabase proměnné prostředí. Prosím zkontrolujte, že máte správně nastaven soubor .env:\n' +
    '  VITE_SUPABASE_URL=your-project-url\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  )
}

export const config = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  }
}