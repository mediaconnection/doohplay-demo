// src/lib/proof/fetchProofByHash.ts
import { supabaseServer } from "@/lib/supabaseServer";

export async function fetchProofByHash(baseHash: string) {
  const { data, error } = await supabaseServer
    .from("evidences")
    .select("*")
    .or(
      `hash.eq.${baseHash},previous_hash.eq.${baseHash}`
    )
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return null;
  }

  return {
    baseHash,
    evidences: data,
    urls: {
      pdf: data.find((e) => e.pdf_url)?.pdf_url ?? null,
      manifest: data.find((e) => e.related_entity_type === "manifest")
        ?.evidence_json_url ?? null,
    },
  };
}