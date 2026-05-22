// src/services/evidences/getEvidenceByHash.ts

import { supabaseServer } from "@/lib/supabaseServer";

export async function getEvidenceByHash(hash: string) {
  // ✅ Em página pública: NUNCA lançar exception
  if (!hash || hash.trim() === "") {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("evidences")
    .select(`
      id,
      hash,
      type,
      created_at,
      pdf_url,
      related_entity_id,
      related_entity_type
    `)
    .eq("hash", hash)
    .single();

  if (error) {
    return null;
  }

  return data;
}