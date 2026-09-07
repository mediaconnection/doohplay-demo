export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
// Etapa 2, item 3, sub-parte 2, Fase 5 (2026-09-06): reusa o client
// oficial de service-role em vez de instanciar o próprio. Confirmado que
// nenhum outro lugar depende do texto exato dos erros
// NEXT_PUBLIC_SUPABASE_URL_NOT_CONFIGURED/SUPABASE_SERVICE_ROLE_KEY_NOT_CONFIGURED
// antes de remover o getEnv() customizado pra essas duas variáveis --
// lib/supabaseServer.ts já lança se faltarem, com mensagem diferente.
import { supabaseAdmin as supabase } from "@/lib/supabaseServer"


export const runtime = "nodejs"

type ProofChainRow = {
  chain_hash: string | null
}

function buildLedgerHash(previousHash: string | null, rootHash: string): string {
  const crypto = require("crypto") as typeof import("crypto")

  return crypto
    .createHash("sha256")
    .update(`${previousHash ?? "GENESIS"}:${normalizeHash(rootHash)}`, "utf8")
    .digest("hex")
}

async function requestTSATimestamp(hash: string) {
  return {
    hash: normalizeHash(hash),
    time: new Date().toISOString(),
    mode: "LOCAL_DEV_TSA"
  }
}

export async function POST() {
    const { buildMerkleRoot, normalizeHash, isHex64 } = await import("@/lib/merkle")

  try {
    const { data, error } = await supabase
      .from("proof_chain")
      .select("chain_hash")
      .is("merkle_batch_id", null)
      .limit(1000)

    if (error) throw new Error(error.message)

    const hashes = ((data ?? []) as ProofChainRow[])
      .map((row) => normalizeHash(row.chain_hash))
      .filter(isHex64)

    if (!hashes.length) {
      return NextResponse.json({
        success: true,
        message: "no events available"
      })
    }

    const root = buildMerkleRoot(hashes)

    if (!root) {
      throw new Error("MERKLE_ROOT_GENERATION_FAILED")
    }

    const { data: batch, error: batchError } = await supabase
      .from("proof_merkle_batches")
      .insert({
        root_hash: root,
        total_events: hashes.length
      })
      .select()
      .single()

    if (batchError) throw new Error(batchError.message)

    await supabase
      .from("proof_chain")
      .update({ merkle_batch_id: batch.id })
      .in("chain_hash", hashes)

    const tsa = await requestTSATimestamp(root)
    const ledgerHash = buildLedgerHash(null, root)

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      root,
      root_hash: root,
      total_events: hashes.length,
      ledger_hash: ledgerHash,
      tsa_time: tsa.time,
      tsa
    })
  } catch (err) {
    console.error("MERKLE_BATCH_ERROR", err)

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    )
  }
}
