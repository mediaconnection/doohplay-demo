// @ts-nocheck
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

const SUPABASE_URL = getRequiredEnv("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")

/* =========================
   CLIENT
========================= */

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
