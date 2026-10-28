import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.SUPABASE_URL_FIRST;
  const key = process.env.SUPABASE_PUBLIC_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables. Set SUPABASE_URL_FIRST and SUPABASE_PUBLIC_KEY.");
  }

  return createBrowserClient(url, key);
}
