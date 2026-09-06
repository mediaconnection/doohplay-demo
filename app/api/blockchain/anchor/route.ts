export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"


export const runtime = "nodejs"

const NETWORK = "polygon"
const API_KEY = process.env.BLOCKCHAIN_API_KEY

type AnchorMethod = "storeRoot" | "anchorMerkle" | string

type AnchorResult = {
  ok: boolean
  root?: string
  tx_hash?: string
  block_number?: number
  confirmations?: number
  method?: AnchorMethod
  already_anchored?: boolean
  db_updated?: number
  error?: string
}

type RawAnchorResult = {
  ok: boolean
  root?: string
  tx_hash?: string | null
  block_number?: number | null
  confirmations?: number
  method?: AnchorMethod
  already_anchored?: boolean
  db_updated?: number
  error?: string
}

type LatestMerkleRootRow = {
  merkle_root: string | null
}

function isAuthorized(req: NextRequest): boolean {
  if (!API_KEY) return false
  return req.headers.get("x-api-key") === API_KEY
}

function normalizeRoot(root: string): string {
  const value = root.trim().toLowerCase()
  return value.startsWith("0x") ? value : `0x${value}`
}

function isValidBytes32(value: string): boolean {
  return /^0x[a-f0-9]{64}$/i.test(value)
}

function normalizeAnchorResult(result: RawAnchorResult): AnchorResult {
  return {
    ok: result.ok,
    root: result.root,
    tx_hash: result.tx_hash ?? undefined,
    block_number: result.block_number ?? undefined,
    confirmations: result.confirmations,
    method: result.method,
    already_anchored: result.already_anchored,
    db_updated: result.db_updated,
    error: result.error
  }
}

async function getLatestMerkleRoot(): Promise<string | null> {
  const res = await pool.query(
    `
    SELECT merkle_root
    FROM public.event_blocks
    WHERE merkle_root IS NOT NULL
      AND (tx_hash IS NULL OR tx_hash = '')
    ORDER BY created_at DESC
    LIMIT 1
    `
  )

  const rows = res.rows as LatestMerkleRootRow[]

  return rows[0]?.merkle_root ?? null
}

async function saveAnchorResult(result: AnchorResult): Promise<void> {
  if (!result.ok || !result.root || !result.tx_hash) return

  await pool.query(
    `
    UPDATE public.event_blocks
    SET
      tx_hash = $1,
      anchored_at = now()
    WHERE lower(replace(merkle_root, '0x', '')) =
          lower(replace($2, '0x', ''))
    `,
    [result.tx_hash, result.root]
  )

  await pool.query(
    `
    INSERT INTO public.blockchain_anchor (
      merkle_root,
      tx_hash,
      block_number,
      network,
      created_at
    )
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT DO NOTHING
    `,
    [result.root, result.tx_hash, result.block_number ?? null, NETWORK]
  )
}

export async function POST(req: NextRequest) {
    const { pool } = await import("@/lib/db")
    const { anchorMerkleRoot } = await import("@proof-engine/blockchain/anchor")

  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    let root: string | null = null

    try {
      const body = await req.json()

      if (typeof body?.root === "string" && body.root.trim()) {
        root = body.root.trim()
      }
    } catch {
      // Body opcional: se não vier root, usa o último bloco pendente.
    }

    if (!root) {
      root = await getLatestMerkleRoot()
    }

    if (!root) {
      return NextResponse.json(
        { ok: false, error: "NO_PENDING_MERKLE_ROOT_FOUND" },
        { status: 404 }
      )
    }

    const normalizedRoot = normalizeRoot(root)

    if (!isValidBytes32(normalizedRoot)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_MERKLE_ROOT" },
        { status: 400 }
      )
    }

    const rawResult = (await anchorMerkleRoot(normalizedRoot)) as RawAnchorResult
    const result = normalizeAnchorResult(rawResult)

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error ?? "ANCHOR_FAILED"
        },
        { status: 400 }
      )
    }

    await saveAnchorResult(result)

    return NextResponse.json(
      {
        ...result,
        network: NETWORK
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("POST /api/blockchain/anchor error:", error)

    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
