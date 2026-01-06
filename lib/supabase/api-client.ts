/**
 * Supabase client for API routes (not Server Actions)
 * This file does NOT use "use server" directive to work properly in API routes
 */
import { createServerClient } from "@supabase/ssr";

/**
 * Create a service role client for API routes
 * Bypasses RLS - use with caution
 */
export function createApiServiceRoleClient() {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for API routes that bypass RLS"
    );
  }

  // Warn if using NEXT_PUBLIC_ prefix (security issue)
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      "⚠️  Using NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - this exposes the key to browsers!"
    );
    console.warn(
      "For security, rename to SUPABASE_SERVICE_ROLE_KEY (without NEXT_PUBLIC_ prefix)"
    );
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
      },
    }
  );
}
