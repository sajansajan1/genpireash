// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// // Create a singleton instance to avoid "Multiple GoTrueClient instances detected"
// let supabaseClientInstance: ReturnType<typeof createClientComponentClient> | null = null

// export const createClient = () => {
//   // Return existing instance if already created
//   if (supabaseClientInstance) {
//     return supabaseClientInstance
//   }

//   // Create new instance if not exists
//   supabaseClientInstance = createClientComponentClient()
//   return supabaseClientInstance
// }


// import { createBrowserClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
