// @ts-nocheck
import { generateMerkleProof } from "./generateMerkleProof"
import { supabaseServer } from "@/lib/supabase"

export async function registerEvidence(data: {
  hash: string
  pdf: string
  signedPdf: string
}) {

  const { data: all } = await supabaseServer
    .from("evidences")
    .select("hash")

  const hashes = (all || []).map((e: Record<string, unknown>) => String(e.hash ?? "")).filter(Boolean)

  hashes.push(data.hash)

  const proof = generateMerkleProof(
    hashes,
    data.hash
  )

  const evidence = {
    hash: data.hash,
    type: "dooh_report",
    pdf_url: data.signedPdf,
    merkle_proof: proof,
    created_at: new Date().toISOString()
  }

  const { error } = await supabaseServer
    .from("evidences")
    .insert(evidence)

  if (error) throw error

  return evidence
}
