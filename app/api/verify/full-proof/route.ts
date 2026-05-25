export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { verifyICP } from "@/lib/domain/proof/verifyICP"
import { verifyMerkleProof } from "@/lib/proof/merkle/verifyMerkleProof"
import { validateTransaction } from "@/lib/blockchain/validateTx"

/* =========================
   CONFIG
========================= */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = "nodejs"

/* =========================
   HELPERS
========================= */

function isValidSHA256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

function normalizeHash(hash: string): string {
  return hash.trim().toLowerCase()
}

const ALLOWED_ENTITY_TYPES = ["campaign", "event", "asset"]

/* =========================
   SCORE ENGINE
========================= */

function computeScore(params: {
  icp: boolean
  merkle: boolean
  tx: boolean
  confirmations: number
}) {
  let score = 0

  if (params.icp) score += 40
  if (params.merkle) score += 30
  if (params.tx) score += 20

  if (params.confirmations > 5) score += 5
  if (params.confirmations > 20) score += 5

  return Math.min(score, 100)
}

/* =========================
   HANDLER
========================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let { hash, entity_id, entity_type } = body ?? {}

    /* =========================
       INPUT VALIDATION
    ========================= */

    if (!hash || typeof hash !== "string") {
      return NextResponse.json({ valid: false, reason: "INVALID_HASH" }, { status: 400 })
    }

    hash = normalizeHash(hash)

    if (!isValidSHA256(hash)) {
      return NextResponse.json({ valid: false, reason: "INVALID_HASH_FORMAT" }, { status: 400 })
    }

    if (!entity_id || typeof entity_id !== "string") {
      return NextResponse.json({ valid: false, reason: "INVALID_ENTITY_ID" }, { status: 400 })
    }

    if (
      !entity_type ||
      typeof entity_type !== "string" ||
      !ALLOWED_ENTITY_TYPES.includes(entity_type)
    ) {
      return NextResponse.json({ valid: false, reason: "INVALID_ENTITY_TYPE" }, { status: 400 })
    }

    /* =========================
       FETCH DATA
    ========================= */

    const { data, error } = await supabase
      .from("digital_certifications")
      .select(`
        content_hash,
        signed_hash,
        merkle_proof,
        merkle_root,
        tx_hash,
        certificate_serial,
        certificate_authority,
        timestamp_token,
        issued_at,
        expires_at,
        immutable,
        proof_url
      `)
      .eq("content_hash", hash)
      .eq("entity_id", entity_id)
      .eq("entity_type", entity_type)
      .eq("is_public", true)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(error)
      return NextResponse.json({ valid: false, reason: "QUERY_ERROR" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ valid: false, reason: "NOT_FOUND" })
    }

    const cert = data

    /* =========================
       ICP VALIDATION
    ========================= */

    let icpValid = false
    let certificate: any = null

    try {
      if (cert.signed_hash) {
        const result = await Promise.resolve(
          verifyICP(cert.signed_hash, cert.content_hash)
        )
        icpValid = result.valid
        certificate = result.certificate
      }
    } catch (e) {
      console.error("ICP ERROR", e)
    }

    /* =========================
       MERKLE VALIDATION
    ========================= */

    let merkleValid = false

    try {
      if (cert.merkle_proof && cert.merkle_root) {
        const _mvr = verifyMerkleProof({
          leaf: cert.content_hash,
          proof: cert.merkle_proof,
          root: cert.merkle_root
        })
        merkleValid = typeof _mvr === "boolean" ? _mvr : _mvr.valid
      }
    } catch (e) {
      console.error("MERKLE ERROR", e)
    }

    /* =========================
       BLOCKCHAIN VALIDATION
    ========================= */

    let txValid = false
    let confirmations = 0
    let txData: any = null

    try {
      if (cert.tx_hash) {
        txData = await validateTransaction(cert.tx_hash)
        txValid = txData.valid
        confirmations = txData.confirmations
      }
    } catch (e) {
      console.error("TX ERROR", e)
    }

    /* =========================
       EXPIRATION
    ========================= */

    const now = Date.now()
    let expired = false

    if (cert.expires_at) {
      const exp = new Date(cert.expires_at).getTime()
      if (!isNaN(exp)) expired = exp < now
    }

    /* =========================
       FINAL SCORE
    ========================= */

    const score = computeScore({
      icp: icpValid,
      merkle: merkleValid,
      tx: txValid,
      confirmations
    })

    const valid =
      icpValid &&
      merkleValid &&
      txValid &&
      !expired &&
      confirmations >= 3

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({
      valid,
      score,

      layers: {
        icp: icpValid,
        merkle: merkleValid,
        blockchain: txValid,
        confirmations
      },

      blockchain: txData
        ? {
            status: txData.status,
            confirmations: txData.confirmations,
            blockNumber: txData.blockNumber,
            timestamp: txData.timestamp,
            gasUsed: txData.gasUsed
          }
        : null,

      certificate: certificate || {
        authority: cert.certificate_authority,
        serial: cert.certificate_serial
      },

      merkle: {
        root: cert.merkle_root,
        proof_length: cert.merkle_proof?.length || 0
      },

      document: {
        hash: cert.content_hash,
        issued_at: cert.issued_at,
        expires_at: cert.expires_at,
        immutable: cert.immutable
      },

      proof: {
        url: cert.proof_url
      },

      legal_basis: [
        "ICP-Brasil",
        "MP 2.200-2/2001",
        "Blockchain Proof",
        "Merkle Integrity",
        "Não repúdio"
      ]
    })

  } catch (err) {
    console.error("FULL PROOF ERROR", err)

    return NextResponse.json(
      { valid: false, reason: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}

