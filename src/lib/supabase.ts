import { createClient } from "@supabase/supabase-js"

let _supabase: ReturnType<typeof createClient> | null = null
let _supabaseServer: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return _supabase
}

export function getSupabaseServer() {
  if (!_supabaseServer) _supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return _supabaseServer
}

// Aliases para não quebrar imports existentes
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabase()[prop as keyof ReturnType<typeof createClient>]
})
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabaseServer()[prop as keyof ReturnType<typeof createClient>]
})