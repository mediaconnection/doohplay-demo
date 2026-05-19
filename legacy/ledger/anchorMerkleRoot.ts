import crypto from "crypto"

import { pool } from "@/lib/db"

type DailyMerkleRootRow = {
  id: number | string
  merkle_root: string
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function buildLocalAnchorProof(merkleRoot: string): string {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        type: "LOCAL_DAILY_MERKLE_ANCHOR",
        merkle_root: merkleRoot,
        generated_at: new Date().toISOString()
      })
    )
    .digest("hex")
}

export async function anchorMerkleRoot() {
  const res = await pool.query(
    `
    SELECT id, merkle_root
    FROM public.daily_merkle_roots
    WHERE anchored = false
    ORDER BY day ASC
    LIMIT 1
    `
  )

  const rows = res.rows as DailyMerkleRootRow[]
  const row = rows[0]

  if (!row) {
    return null
  }

  const merkleRoot = normalizeHash(row.merkle_root)

  if (!merkleRoot) {
    throw new Error("INVALID_MERKLE_ROOT")
  }

  const proof = buildLocalAnchorProof(merkleRoot)

  await pool.query(
    `
    UPDATE public.daily_merkle_roots
    SET
      anchored = true,
      anchor_tx = $1
    WHERE id = $2
    `,
    [proof, row.id]
  )

  return {
    merkle_root: merkleRoot,
    anchor_proof: proof,
    anchor_type: "LOCAL_SHA256"
  }
}

export default anchorMerkleRoot