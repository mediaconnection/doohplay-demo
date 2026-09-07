// @ts-nocheck
// @deprecated — código morto, confirmado 2026-09-06 (consolidação de
// clients Supabase, Etapa 2 sub-parte 2): inalcançável em runtime (mesmo
// motivo de src/lib/supabase.ts). Achado à parte: se algo aqui chegasse a
// rodar, faz fallback silencioso pra SUPABASE_ANON_KEY quando falta a
// service-role key -- viraria um client anon travestido de "server", sem
// aviso nenhum. Módulo oficial: lib/supabaseServer.ts. Não editar/estender.
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// 🔒 Validação mínima (evita erro silencioso)
const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL não configurado");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY não configurado");
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
