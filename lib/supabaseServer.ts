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