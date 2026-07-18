import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside API routes / server components — reads the session from cookies
// so RLS policies (auth.uid()) work correctly on the server too.
// Next.js 16 made cookies() an async function, so this must be awaited —
// callers now need `await createClient()` instead of `createClient()`.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* called from a Server Component; middleware refreshes the session instead */ }
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: "", ...options }); } catch { /* see above */ }
        },
      },
    }
  );
}

// Used only in trusted server-only scripts (seed script, admin batch import) —
// bypasses RLS entirely. NEVER import this in client code or expose the key to the browser.
export function createServiceRoleClient() {
  const { createClient: createRawClient } = require("@supabase/supabase-js");
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
