// @deprecated — código morto, confirmado 2026-09-06 (consolidação de
// clients Supabase, Etapa 2 sub-parte 2): inalcançável (o alias @/supabase
// sempre resolve pra raiz), sem import relativo real. Módulo oficial de
// client anon: lib/supabase.ts. Não editar/estender.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
