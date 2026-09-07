// @ts-nocheck
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Etapa 2, item 3, sub-parte 2 (2026-09-06): este arquivo instanciava seu
// próprio client service-role, com um fallback (SUPABASE_URL ??
// NEXT_PUBLIC_SUPABASE_URL) diferente do usado por lib/supabaseServer.ts (só
// NEXT_PUBLIC_SUPABASE_URL) -- confirmado com rota de diagnóstico temporária
// que os dois valores são idênticos em produção, então reexportar daqui não
// muda comportamento de nenhum consumidor real (incluindo os comerciais,
// app/api/studio/schedule-rule e app/api/invoices/[invoice_id]/pdf, que
// também importam supabaseServer deste módulo). Fonte única de verdade
// agora é lib/supabaseServer.ts.
export { supabaseServer } from "./supabaseServer"
