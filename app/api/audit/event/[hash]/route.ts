// C:\DOOHPLAY\dashboard-web\app\api\audit\event\[hash]\route.ts

import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

import {
  buildMerkleProof,
  type MerkleProofNode
} from "@/lib/domain/proof/merkleProof"

import { verifyMerkleProof } from "@proof-engine/proof/merkle/verifyMerkleProof"

import { verifyBlockHash } from "@/lib/domain/proof/verifyBlock"
import { verifySignature } from "@/lib/domain/proof/signature"
import { verifyEventChain } from "@/lib/domain/ledger/verifyChain"
import { calculateTrustScore, getTrustLabel } from "@/lib/domain/trustScore"
import { buildMerkleRoot } from "@/lib/domain/proof/buildMerkleRoot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* =========================
   TYPES
========================= */

type EventRow = {
  event_id: string | number | null
  event_hash: string | null
  prev_hash: string | null
  payload: Record<string, unknown> | null
  block_id: string | number | null
  created_at: string | Date | null
  merkle_root: string | null
  block_hash: string | null
  prev_block_hash: string | null
  signature: string | null
  tx_hash: string | null
  network: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

type ChainVerificationResult = {
  valid?: boolean
  depth?: number
  [key: string]: unknown
}

/* =========================
   HELPERS
========================= */

function normalizeHashSafe(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")

  return /^[a-f0-9]{64}$/.test(normalized)
    ? normalized
    : null
}

function isValidHash(value: unknown): value is string {
  return normalizeHashSafe(value) !== null
}

function normalizeDate(value: unknown): string | null {
  if (!value) {
    return null
  }

  const date = new Date(String(value))

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString()
}

function asEventRows(rows: unknown[]): EventRow[] {
  return rows as EventRow[]
}

function asBlockEventRows(rows: unknown[]): BlockEventRow[] {
  return rows as BlockEventRow[]
}

/* =========================
   ROUTE
========================= */

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      hash: string
    }>
  }
) {
  void req

  try {
    const { hash: rawHash } = await context.params

    if (!isValidHash(rawHash)) {
      return NextResponse.json(
        {
          error: "Invalid hash format"
        },
        {
          status: 400
        }
      )
    }

    const hash = normalizeHashSafe(rawHash)

    if (!hash) {
      return NextResponse.json(
        {
          error: "Invalid hash"
        },
        {
          status: 400
        }
      )
    }

    /* =========================
       EVENT
    ========================= */

    const eventRes = await pool.query(
      `
      select
        e.event_id,
        e.event_hash,
        e.previous_event_hash as prev_hash,
        e.payload,
        e.block_id,
        e.created_at,
        b.merkle_root,
        b.block_hash,
        b.prev_block_hash,
        b.signature,
        b.tx_hash,
        b.network
      from public.event_chain e
      left join public.event_blocks b
        on e.block_id = b.id
      where lower(replace(e.event_hash, '0x', '')) = $1
      limit 1
      `,
      [hash]
    )

    const eventRows = asEventRows(eventRes.rows)

    if (!eventRows.length || !eventRows[0]) {
      return NextResponse.json(
        {
          error: "Event not found"
        },
        {
          status: 404
        }
      )
    }

    const event = eventRows[0]

    const eventHash = normalizeHashSafe(event.event_hash)

    if (!eventHash) {
      return NextResponse.json(
        {
          error: "Corrupted event hash"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       CHAIN VALIDATION
    ========================= */

    let chainValid = false
    let chainDepth = 0

    try {
      const result = (await verifyEventChain(
        eventHash
      )) as ChainVerificationResult

      chainValid = result?.valid === true
      chainDepth = Number(result?.depth ?? 0)
    } catch (error) {
      console.error("AUDIT_EVENT_CHAIN_ERROR", error)
    }

    /* =========================
       MERKLE
    ========================= */

    let merkleProof: MerkleProofNode[] = []

    let merkleValid = false
    let merkleStructureValid = false
    let merkleRootMatches = false

    const root = normalizeHashSafe(event.merkle_root)

    if (event.block_id && root) {
      try {
        const blockRes = await pool.query(
          `
          select event_hash
          from public.event_chain
          where block_id = $1
            and event_hash is not null
          order by chain_index asc
          `,
          [event.block_id]
        )

        const blockRows = asBlockEventRows(blockRes.rows)

        const hashes = blockRows
          .map((row) => normalizeHashSafe(row.event_hash))
          .filter((value): value is string => Boolean(value))

        if (!hashes.length) {
          throw new Error("EMPTY_BLOCK")
        }

        if (!hashes.includes(eventHash)) {
          throw new Error("EVENT_NOT_IN_BLOCK")
        }

        merkleStructureValid = true

        const proof = buildMerkleProof(hashes, eventHash)

        if (!proof || !Array.isArray(proof)) {
          throw new Error("PROOF_GENERATION_FAILED")
        }

        merkleProof = proof

        const verifyResult = verifyMerkleProof({
          leaf: eventHash,
          proof,
          root
        })

        merkleValid =
          typeof verifyResult === "object"
            ? verifyResult.valid === true
            : verifyResult === true

        const rebuiltRoot = buildMerkleRoot(hashes)

        merkleRootMatches =
          normalizeHashSafe(rebuiltRoot) === root
      } catch (error) {
        console.error("AUDIT_EVENT_MERKLE_ERROR", error)
      }
    }

    /* =========================
       BLOCK
    ========================= */

    let blockValid = false
    let signatureValid = false

    const blockHash = normalizeHashSafe(event.block_hash)
    const prevBlockHash = normalizeHashSafe(event.prev_block_hash)

    const signature =
      typeof event.signature === "string"
        ? event.signature
        : null

    if (
      blockHash &&
      root &&
      prevBlockHash
    ) {
      try {
        blockValid = verifyBlockHash(
          prevBlockHash,
          root,
          blockHash
        )

        if (signature) {
          signatureValid = verifySignature(
            blockHash,
            signature
          )
        }
      } catch (error) {
        console.error("AUDIT_EVENT_BLOCK_ERROR", error)
      }
    }

    /* =========================
       BLOCKCHAIN
    ========================= */

    const anchored = Boolean(event.tx_hash)

    /* =========================
       TRUST
    ========================= */

    const merkleFullyValid =
      merkleValid &&
      merkleStructureValid &&
      merkleRootMatches

    const trustScore = calculateTrustScore({
      chain_valid: chainValid,
      merkle_valid: merkleFullyValid,
      block_valid: blockValid,
      signature_valid: signatureValid,
      anchored
    })

    const trustLabel = getTrustLabel(trustScore)

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({
      event: {
        id: event.event_id,
        hash: event.event_hash,
        prev_hash: event.prev_hash,
        created_at: normalizeDate(event.created_at)
      },

      block: event.block_id
        ? {
            id: event.block_id,
            merkle_root: event.merkle_root,
            block_hash: event.block_hash,
            prev_block_hash: event.prev_block_hash
          }
        : null,

      blockchain: anchored
        ? {
            tx_hash: event.tx_hash,
            network: event.network
          }
        : null,

      merkle_proof: merkleProof,

      verification: {
        chain_valid: chainValid,
        chain_depth: chainDepth,

        merkle_valid: merkleValid,
        merkle_structure_valid: merkleStructureValid,
        merkle_root_matches: merkleRootMatches,

        block_valid: blockValid,
        signature_valid: signatureValid,

        anchored,

        fully_verified:
          chainValid &&
          merkleFullyValid &&
          blockValid &&
          signatureValid &&
          anchored
      },

      trust: {
        score: trustScore,
        label: trustLabel
      }
    })
  } catch (error) {
    console.error("AUDIT_EVENT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        detail:
          error instanceof Error
            ? error.message
            : String(error)
      },
      {
        status: 500
      }
    )
  }
}