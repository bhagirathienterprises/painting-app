import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missingConfigError = new Error(
  'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables.'
)

function createFallbackClient() {
  const chain = () => ({
    select: () => Promise.resolve({ data: [], error: missingConfigError }),
    insert: () => Promise.resolve({ error: missingConfigError }),
    update: () => Promise.resolve({ error: missingConfigError }),
    delete: () => Promise.resolve({ error: missingConfigError }),
    eq: () => chain(),
    gte: () => chain(),
    order: () => chain(),
    limit: () => chain(),
    maybeSingle: () => Promise.resolve({ data: null, error: missingConfigError }),
  })

  return {
    from: () => chain(),
  }
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createFallbackClient()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)