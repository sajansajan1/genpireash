// import { createServerClient } from "@supabase/ssr"
// import { cookies } from "next/headers"

// // Create a singleton instance to avoid "Multiple GoTrueClient instances detected"
// let supabaseServerClient: ReturnType<typeof createServerClient> | null = null

// export function createClient() {
//   const cookieStore = cookies()

//   // Return existing instance if already created
//   if (supabaseServerClient) {
//     return supabaseServerClient
//   }

//   // Create new instance if not exists
//   supabaseServerClient = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name) {
//           return cookieStore.get(name)?.value
//         },
//         set(name, value, options) {
//           cookieStore.set({ name, value, ...options })
//         },
//         remove(name, options) {
//           cookieStore.set({ name, value: "", ...options })
//         },
//       },
//     },
//   )

//   return supabaseServerClient
// }
"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.error("Error setting cookies:", error);
          }
        },
      },
      global: {
        fetch: (url, options = {}) => {
          // Add timeout to all fetch requests (30 seconds)
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000);

          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));
        },
      },
    }
  );
}

// Service role client for storage operations (bypasses RLS)
export async function createServiceRoleClient() {
  // Check both with and without NEXT_PUBLIC_ prefix
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key");
    return createClient();
  }

  // Warn if using NEXT_PUBLIC_ prefix (security issue)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️  Using NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - this exposes the key to browsers!");
    console.warn("For security, rename to SUPABASE_SERVICE_ROLE_KEY (without NEXT_PUBLIC_ prefix)");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service role doesn't need cookies
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
