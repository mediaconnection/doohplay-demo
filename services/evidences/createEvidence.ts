// src/services/evidences/createEvidence.ts
// 🔐 Serviço crítico: criação OU recuperação de evidence imutável

import { supabaseServer } from "@/lib/supabaseServer";

export interface CreateEvidenceParams {
  hash: string;
  type: "report" | "invoice" | "evidence" | "proof_validation" | "notary_request" | "manifest" | "tsa";
  relatedEntityId?: string;
  relatedEntityType?: string;
  pdfUrl?: string;
  evidenceJsonUrl?: string;
}

/**
 * Cria uma evidence imutável.
 * Se a evidence já existir (mesmo hash), retorna a existente.
 * ⚠️ Idempotente por definição.
 */
export async function createEvidence(params: CreateEvidenceParams) {
  if (!params.hash || params.hash.trim() === "") {
    throw new Error("Evidence hash is required");
  }

  // 1️⃣ Tenta buscar evidence existente
  const { data: existing, error: selectError } = await supabaseServer
    .from("evidences")
    .select("*")
    .eq("hash", params.hash)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Falha ao consultar evidence: ${selectError.message}`);
  }

  if (existing) {
    return existing;
  }

  // 2️⃣ Não existe → cria
  const { data, error } = await supabaseServer
    .from("evidences")
    .insert({
      hash: params.hash,
      type: params.type,
      related_entity_id: params.relatedEntityId ?? null,
      related_entity_type: params.relatedEntityType ?? null,
      pdf_url: params.pdfUrl ?? null,
      evidence_json_url: params.evidenceJsonUrl ?? null,
      signed: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao criar evidence: ${error.message}`);
  }

  return data;
}