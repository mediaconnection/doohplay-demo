import { createClient } from "@supabase/supabase-js"

/* =========================
   HELPERS
========================= */

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name}_NOT_CONFIGURED`)
  }

  return value
}

/* =========================
   CONFIG
========================= */

const SUPABASE_URL = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL")
const SUPABASE_ANON_KEY = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

/* =========================
   CLIENT
========================= */

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)