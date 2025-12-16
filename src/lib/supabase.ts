import { createClient } from '@supabase/supabase-js'

// Clean environment variables (remove whitespace/newlines)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key').trim()

// Debug logging
if (typeof window !== 'undefined') {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl)
  console.log('[Supabase] Anon key present:', supabaseAnonKey !== 'placeholder-key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
