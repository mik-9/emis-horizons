import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

// A bad deployment setting must not crash the whole application at import time.
function createConfiguredClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (input, options = {}) => fetch(input, {
          ...options,
          signal: options.signal
            ? AbortSignal.any([options.signal, AbortSignal.timeout(20000)])
            : AbortSignal.timeout(20000),
        }),
      },
    })
  } catch {
    return null
  }
}

// Keep the interface usable when a developer has not created their local .env.
// Supabase throws during module initialization when either value is missing,
// which would otherwise leave Vite displaying a completely blank page.
export const supabase = createConfiguredClient()
export const isSupabaseConfigured = Boolean(supabase)
