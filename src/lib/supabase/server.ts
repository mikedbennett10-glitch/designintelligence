import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/types/database";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Uses the anon key + the caller's session cookies, so RLS is
 * enforced as the signed-in user — this is NOT a service-role client.
 *
 * Call this per-request (it reads `cookies()`, which is request-scoped);
 * don't hoist the result to module scope.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
          } catch {
            // Called from a Server Component — middleware handles session
            // refresh instead, so a failed cookie write here is safe to
            // ignore (see the Supabase SSR docs for this exact pattern).
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client. Bypasses RLS entirely — use ONLY in
 * server-side code that must act with elevated privileges (e.g. the
 * Procore/Anthropic proxy routes' internal writes, admin tooling).
 * SUPABASE_SERVICE_ROLE_KEY must never be imported into client code.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service-role client is not session-bound; nothing to persist.
        },
      },
    }
  );
}
