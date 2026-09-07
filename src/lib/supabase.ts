// @deprecated — código morto, confirmado 2026-09-06 (consolidação de
// clients Supabase, Etapa 2 sub-parte 2): inalcançável em runtime (o alias
// @/lib do next.config.ts sempre resolve pra raiz, nunca pra src/lib), e
// sem nenhum import relativo real. Módulos oficiais: lib/supabase.ts
// (anon) e lib/supabaseServer.ts (service-role). Não editar/estender.
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