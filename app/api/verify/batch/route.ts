export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

import {
  buildBatchMerkleProofs,
  verifyMerkleProof
} from "@/lib/domain/proof/batchMerkle"

export const runtime = "nodejs"

type Body = {
  hashes?: string[]
  block_id?: number
  verify_blockchain?: boolean
}

type BlockRow = {
  id: number
  merkle_root: string | null
  block_hash: string | null
  tx_hash: string | null
  anchored_at: string | null
}

type EventHashRow = {
  event_hash: string | null
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

export async function POST(req: NextRequest) {
    const { pool } = await import("@/lib/db")
    const { verifyAnchoredRoot } = await import("@/lib/blockchain/verifyAnchoredRoot")

  try {
    const body = (await req.json()) as Body

    const inputHashes = Array.isArray(body.hashes)
      ? body.hashes.map(normalizeHash).filter(isValidHash)
      : []

    if (!inputHashes.length && !body.block_id) {
      return NextResponse.json(
        {
          ok: false,
          error: "HASHES_OR_BLOCK_ID_REQUIRED"
        },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      let hashes = inputHashes
      let block: BlockRow | null = null

      if (body.block_id) {
        const blockResult = await client.query(
          `
          select
            id,
            merkle_root,
            block_hash,
            tx_hash,
            anchored_at
          from public.event_blocks
          where id = $1
          limit 1
          `,
          [body.block_id]
        )

        const blockRows = blockResult.rows as BlockRow[]
        block = blockRows[0] ?? null

        if (!block) {
          return NextResponse.json(
            {
              ok: false,
              error: "BLOCK_NOT_FOUND"
            },
            { status: 404 }
          )
        }

        const eventsResult = await client.query(
          `
          select event_hash
          from public.event_chain
          where block_id = $1
            and event_hash is not null
          order by chain_index asc nulls last, id asc
          `,
          [body.block_id]
        )

        const eventRows = eventsResult.rows as EventHashRow[]

        hashes = eventRows
          .map((row: EventHashRow) => row.event_hash)
          .filter((value): value is string => typeof value === "string")
          .map(normalizeHash)
          .filter(isValidHash)
      }

      if (!hashes.length) {
        return NextResponse.json(
          {
            ok: false,
            error: "NO_VALID_HASHES_FOUND"
          },
          { status: 400 }
        )
      }

      const proofs = await buildBatchMerkleProofs(hashes)
      const computedRoot = proofs[0]?.root ?? null
      const storedRoot = block?.merkle_root
        ? normalizeHash(block.merkle_root)
        : null

      const rootMatches =
        storedRoot && computedRoot
          ? storedRoot === computedRoot
          : null

      const items = proofs.map((item) => ({
        hash: item.leaf,
        merkle_root: item.root,
        proof: item.proof,
        proof_valid: verifyMerkleProof(item.leaf, item.proof, item.root)
      }))

      const blockchain =
        body.verify_blockchain && block?.tx_hash && storedRoot
          ? await verifyAnchoredRoot({
              txHash: block.tx_hash,
              expectedRoot: storedRoot,
              minConfirmations: 1
            })
          : null

      const allProofsValid = items.every((item) => item.proof_valid)

      const status =
        allProofsValid &&
        (rootMatches === true || rootMatches === null) &&
        (!body.verify_blockchain || blockchain?.anchored === true)
          ? "VERIFIED"
          : allProofsValid
            ? "WARNING"
            : "FAILED"

      return NextResponse.json({
        ok: true,
        status,
        summary: {
          total: items.length,
          proofs_valid: items.filter((item) => item.proof_valid).length,
          proofs_invalid: items.filter((item) => !item.proof_valid).length,
          computed_merkle_root: computedRoot,
          stored_merkle_root: storedRoot,
          root_matches: rootMatches,
          blockchain_checked: Boolean(blockchain),
          blockchain_anchored: blockchain?.anchored ?? null
        },
        block,
        blockchain,
        items
      })
    } finally {
      client.release()
    }
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "BATCH_VERIFY_FAILED",
        message: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    )
  }
}
