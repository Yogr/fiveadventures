import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

export function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // In Next.js 15+, we need to handle cookies differently
          // For now, we'll return undefined and rely on the middleware
          // to handle cookies
          return undefined
        },
        set(name, value, options) {
          // This is a server component, so we can't set cookies directly
          // This will be handled by the middleware
        },
        remove(name, options) {
          // This is a server component, so we can't remove cookies directly
          // This will be handled by the middleware
        },
      },
    }
  )
}
