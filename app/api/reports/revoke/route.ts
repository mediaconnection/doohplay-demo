// @deprecated — rota morta, confirmado 2026-09-06 (consolidação de
// clients Supabase, Etapa 2 sub-parte 2): este arquivo não exporta
// nenhum handler HTTP (GET/POST/etc.), só define getSupabaseServer()/
// supabaseServer -- não é uma rota funcional. O único chamador plausível
// seria o <form action="/admin/reports/revoke?..."> em
// app/admin/reports/page.tsx, mas esse action aponta pra uma rota de
// PÁGINA (/admin/reports/revoke), não pra esta rota de API
// (/api/reports/revoke) -- e /admin/reports/revoke também não existe no
// repositório. Órfã dos dois lados. Decisão de apagar ou não fica
// registrada como pendência separada em STATUS_PROJETO.md, fora do
// escopo desta marcação.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _server: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (!_server) {
    _server = createClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )
  }
  return _server
}

export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseServer()
    const value = client[prop as keyof SupabaseClient]
    return typeof value === "function" ? value.bind(client) : value
  },
})
