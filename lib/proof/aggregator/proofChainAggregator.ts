import crypto from "crypto"
import { db, pool } from "@/lib/db"
import { getUnanchoredEvents } from "@/lib/ledger/getUnanchoredEvents"
import { signHash } from "@/services/pdf/pdfSigner"
import { anchorMerkleRoot } from "@/lib/blockchain/anchor"
import { createTsaToken } from "@/lib/tsa/createTsaToken"

export type AggregatorResult = {
  events_processed: number
  block_id: string | null
  merkle_root: string | null
  tx_hash: string | null
  tsa_ok: boolean
  skipped: boolean
  error?: string
}

/* =========================
   MERKLE HELPERS
   Uses sha256(0x01 || left || right) — same as verifyMerkleProof
========================= */

function hashNode(left: string, right: string): string {
  const l = Buffer.from(left.toLowerCase().replace(/^0x/, ""), "hex")
  const r = Buffer.from(right.toLowerCase().replace(/^0x/, ""), "hex")
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([0x01]), l, r]))
    .digest("hex")
}

type MerkleTree = { root: string; tree: string[][] }

function buildCompatibleMerkleTree(leaves: string[]): MerkleTree {
  if (leaves.length === 0) throw new Error("Cannot build Merkle tree with 0 leaves")

  let level = [...leaves]
  const tree: string[][] = [level]

  while (level.length > 1) {
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left
      next.push(hashNode(left, right))
    }
    level = next
    tree.push(level)
  }

  return { root: level[0], tree }
}

type ProofItem = { position: "left" | "right"; hash: string }

function getMerkleProofForLeaf(leaves: string[], leaf: string, tree: string[][]): ProofItem[] {
  const proof: ProofItem[] = []
  let index = leaves.indexOf(leaf)
  if (index === -1) throw new Error(`Leaf ${leaf} not found`)

  for (let level = 0; level < tree.length - 1; level++) {
    const layer = tree[level]
    const isRight = index % 2 === 1
    const siblingIndex = isRight ? index - 1 : index + 1

    if (siblingIndex < layer.length) {
      proof.push({
        position: isRight ? "left" : "right",
        hash: layer[siblingIndex],
      })
    }

    index = Math.floor(index / 2)
  }

  return proof
}

/* =========================
   MAIN PIPELINE
========================= */

export async function runProofChainAggregator(): Promise<AggregatorResult> {
  // 1 — Fetch unanchored events
  const events = await getUnanchoredEvents(500)

  if (events.length === 0) {
    console.log("[proofchain] No unanchored events. Skipping.")
    return { events_processed: 0, block_id: null, merkle_root: null, tx_hash: null, tsa_ok: false, skipped: true }
  }

  console.log(`[proofchain] Processing ${events.length} events`)

  // 2 — RSA-sign each event hash (best-effort; continues if keys/private.pem absent)
  for (const event of events) {
    if (event.signature) continue
    try {
      const sig = signHash(event.event_hash)
      await db.query(
        `UPDATE public.event_chain SET signature = $1 WHERE id = $2`,
        [sig, event.id]
      )
      event.signature = sig
    } catch (err) {
      console.warn(`[proofchain] Signing skipped for ${event.event_hash}:`, (err as Error).message)
    }
  }

  // 3 — Build Merkle tree from event hashes
  const hashes = events.map((e) => e.event_hash)
  const { root: merkleRoot, tree } = buildCompatibleMerkleTree(hashes)
  console.log(`[proofchain] merkle_root = ${merkleRoot}`)

  // 4 — Compute block hash (sha256 of prev_block_hash + merkle_root + timestamp)
  const prevResult = await db.query<{ block_hash: string | null }>(
    `SELECT block_hash FROM public.event_blocks ORDER BY created_at DESC LIMIT 1`
  )
  const prevBlockHash = prevResult.rows[0]?.block_hash ?? ""
  const blockHashInput = `${prevBlockHash}:${merkleRoot}:${Date.now()}`
  const blockHash = crypto.createHash("sha256").update(blockHashInput).digest("hex")

  // 5 — Insert event_blocks record
  const blockInsert = await db.query<{ id: string }>(
    `
    INSERT INTO public.event_blocks (merkle_root, block_hash, prev_block_hash, created_at)
    VALUES ($1, $2, $3, now())
    RETURNING id::text
    `,
    [merkleRoot, blockHash, prevBlockHash || null]
  )
  const blockId = blockInsert.rows[0]?.id
  if (!blockId) throw new Error("[proofchain] Failed to insert event_blocks record")
  console.log(`[proofchain] Created block ${blockId}`)

  // 6 — Assign events to block + store per-event merkle proofs (single transaction)
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const event of events) {
      const proof = getMerkleProofForLeaf(hashes, event.event_hash, tree)
      await client.query(
        `UPDATE public.event_chain
         SET block_id = $1, merkle_proof = $2::jsonb
         WHERE id = $3`,
        [blockId, JSON.stringify(proof), event.id]
      )
    }
    await client.query("COMMIT")
    console.log(`[proofchain] Assigned ${events.length} events to block ${blockId}`)
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }

  // 7 — Anchor Merkle root to Polygon blockchain (best-effort)
  let txHash: string | null = null
  try {
    const anchorResult = await anchorMerkleRoot(merkleRoot)
    if (anchorResult.ok && anchorResult.tx_hash) {
      txHash = anchorResult.tx_hash
      await db.query(
        `UPDATE public.event_blocks SET tx_hash = $1, anchored_at = now() WHERE id = $2`,
        [txHash, blockId]
      )
      console.log(`[proofchain] Anchored to blockchain: ${txHash}`)
    } else if (!anchorResult.ok) {
      console.warn("[proofchain] Blockchain anchor failed:", anchorResult.error)
    }
  } catch (err) {
    console.warn("[proofchain] Blockchain anchor skipped:", (err as Error).message)
  }

  // 8 — TSA timestamp (best-effort)
  let tsaOk = false
  try {
    const tsaToken = await createTsaToken(Buffer.from(merkleRoot, "hex"))
    const tsaB64 = tsaToken.toString("base64")
    await db.query(
      `UPDATE public.event_blocks SET tsa_token = $1 WHERE id = $2`,
      [tsaB64, blockId]
    )
    tsaOk = true
    console.log(`[proofchain] TSA token stored for block ${blockId}`)
  } catch (err) {
    console.warn("[proofchain] TSA skipped:", (err as Error).message)
  }

  return {
    events_processed: events.length,
    block_id: blockId,
    merkle_root: merkleRoot,
    tx_hash: txHash,
    tsa_ok: tsaOk,
    skipped: false,
  }
}
