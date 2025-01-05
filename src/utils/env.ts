import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { join } from 'path'

export function loadEnv() {
  const env = config({ path: join(process.cwd(), '.env') }).parsed || {}
  expand({ parsed: env })

  return {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
  }
}