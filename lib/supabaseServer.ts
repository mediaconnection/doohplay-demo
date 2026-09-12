// Implementação real vive em packages/shared-infra/supabaseServer.ts
// (workspace package @doohplay/shared-infra) -- este arquivo é reexport
// puro, único caminho sancionado para import (@/lib/supabaseServer e
// caminhos relativos pra cá, incluindo a ponte lib/supabase.ts, continuam
// funcionando sem mudança).
export { supabaseAdmin, getSupabaseAdmin, supabaseServer } from "@doohplay/shared-infra/supabaseServer"
