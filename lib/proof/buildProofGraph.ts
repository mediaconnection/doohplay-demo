// @ts-nocheck
import { pool } from "@/lib/db"
import { getMerkleProof } from "@/lib/merkle"

type DbRow = Record<string, unknown>

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => safeString(item))
    .filter((item): item is string => Boolean(item))
}

export async function buildProofGraph(impressionId: string) {
  const impressionRes = await pool.query(
    `
    select *
    from public.impressions
    where id::text = $1
    limit 1
    `,
    [impressionId]
  )

  const impressions = impressionRes.rows as DbRow[]
  const impression = impressions[0]

  if (!impression) {
    throw new Error("Impression not found")
  }

  const evidenceRes = await pool.query(
    `
    select *
    from public.evidence
    where impression_id::text = $1
    `,
    [impressionId]
  )

  const evidence = evidenceRes.rows as DbRow[]
  const firstEvidenceId = safeString(evidence[0]?.id)

  const leafRes = firstEvidenceId
    ? await pool.query(
        `
        select *
        from public.merkle_leaves
        where evidence_id::text = $1
        limit 1
        `,
        [firstEvidenceId]
      )
    : { rows: [] }

  const leaves = leafRes.rows as DbRow[]
  const leaf = leaves[0] ?? null

  const batchId = safeString(leaf?.batch_id)

  const batchRes = batchId
    ? await pool.query(
        `
        select *
        from public.merkle_batches
        where batch_id::text = $1
        limit 1
        `,
        [batchId]
      )
    : { rows: [] }

  const batches = batchRes.rows as DbRow[]
  const batch = batches[0] ?? null

  const leafHash = safeString(leaf?.leaf_hash)
  const merkleRoot = safeString(batch?.merkle_root)

  const batchLeaves =
    safeStringArray(batch?.leaves).length > 0
      ? safeStringArray(batch?.leaves)
      : evidence
          .map((item) => safeString(item.hash ?? item.evidence_hash))
          .filter((item): item is string => Boolean(item))

  const proof =
    leafHash && batchLeaves.length > 0
      ? getMerkleProof(batchLeaves, leafHash)
      : null

  const blockRes = merkleRoot
    ? await pool.query(
        `
        select *
        from public.event_chain
        where merkle_root = $1
        limit 1
        `,
        [merkleRoot]
      )
    : { rows: [] }

  const blocks = blockRes.rows as DbRow[]
  const block = blocks[0] ?? null

  const anchorRes = merkleRoot
    ? await pool.query(
        `
        select *
        from public.anchors
        where merkle_root = $1
        limit 1
        `,
        [merkleRoot]
      )
    : { rows: [] }

  const anchors = anchorRes.rows as DbRow[]
  const anchor = anchors[0] ?? null

  const certRes = await pool.query(
    `
    select *
    from public.proof_certificates
    where subject_id::text = $1
    limit 1
    `,
    [impressionId]
  )

  const certificates = certRes.rows as DbRow[]
  const certificate = certificates[0] ?? null

  return {
    subject: {
      id: impression.id,
      type: "impression",
      hash: impression.hash
    },

    screen: {
      id: impression.screen_id
    },

    campaign: {
      id: impression.campaign_id
    },

    evidence,

    merkle: {
      leaf_hash: leafHash,
      root: merkleRoot,
      leaves: batchLeaves,
      proof
    },

    block: block
      ? {
          block_height: block.block_height,
          event_hash: block.event_hash,
          previous_hash: block.previous_hash
        }
      : null,

    anchor: anchor
      ? {
          network: anchor.anchor_network,
          tx: anchor.anchor_tx,
          timestamp: anchor.timestamp
        }
      : null,

    certificate
  }
}

export default buildProofGraph
