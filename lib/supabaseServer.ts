import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL não definida")
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida")

let _admin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }
  return _admin
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin()
    const value = client[prop as keyof SupabaseClient]
    return typeof value === "function" ? value.bind(client) : value
  },
})

/**
 * Alias para compatibilidade com imports que usam 'supabaseServer'.
 * Corrige: 'supabaseServer' is not exported from '@/lib/supabaseServer'
 */
export const supabaseServer = supabaseAdmin
