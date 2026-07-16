import { createBrowserClient } from "@supabase/ssr";

// Used inside "use client" components (e.g. AppShell.jsx) for auth + queries
// that run in the browser. Reads the two public, safe-to-expose env vars.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
