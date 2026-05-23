// src/lib/supabaseServer.ts
// ⚠️ USO EXCLUSIVO SERVER-SIDE (SERVICE ROLE)

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com SERVICE ROLE.
 * - Ignora RLS
 * - Usado APENAS para operações internas:
 *   evidences, invoices, jobs, auditoria
 */
export { supabase } from "@/lib/supabase"

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
