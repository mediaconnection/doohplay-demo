import { pool } from "@/lib/db"
import { buildProofGraph } from "../buildProofGraph"

type PgClient = {
  query: (
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: Record<string, unknown>[] }>
  release: () => void
}

type DbRecord = Record<string, unknown>

type NodeMap = {
  impression?: string
  screen?: string
  campaign?: string
  merkle?: string
  block?: string
  anchor?: string
  certificate?: string
}

function safeString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asRecord(value: unknown): DbRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DbRecord)
    : {}
}

async function upsertNode(
  client: PgClient,
  type: string,
  ref: string,
  hash: string | null
): Promise<string> {
  const res = await client.query(
    `
    insert into public.proof_nodes (
      node_type,
      ref_id,
      hash
    )
    values ($1, $2, $3)
    on conflict (node_type, ref_id)
    do update set hash = excluded.hash
    returning node_id::text as node_id
    `,
    [type, ref, hash]
  )

  const nodeId = safeString(res.rows[0]?.node_id)

  if (!nodeId) {
    throw new Error("PROOF_NODE_UPSERT_FAILED")
  }

  return nodeId
}

async function createEdge(
  client: PgClient,
  from: string,
  to: string,
  relation: string
): Promise<void> {
  await client.query(
    `
    insert into public.proof_edges (
      from_node,
      to_node,
      relation
    )
    values ($1, $2, $3)
    on conflict do nothing
    `,
    [from, to, relation]
  )
}

export async function buildProofGraphNetwork(impressionId: string) {
  const graph = await buildProofGraph(impressionId)

  const subject = asRecord(graph?.subject)
  const screen = asRecord(graph?.screen)
  const campaign = asRecord(graph?.campaign)
  const merkle = asRecord(graph?.merkle)
  const block = asRecord(graph?.block)
  const anchor = asRecord(graph?.anchor)
  const certificate = asRecord(graph?.certificate)

  const subjectId = safeString(subject.id)
  const subjectHash = safeString(subject.hash)

  if (!subjectId) {
    throw new Error("Invalid proof graph")
  }

  const nodes: NodeMap = {}
  const client = (await pool.connect()) as PgClient

  try {
    await client.query("BEGIN")

    nodes.impression = await upsertNode(
      client,
      "impression",
      subjectId,
      subjectHash
    )

    const screenId = safeString(screen.id)

    if (screenId) {
      nodes.screen = await upsertNode(client, "screen", screenId, null)

      await createEdge(client, nodes.screen, nodes.impression, "PLAYED")
    }

    const campaignId = safeString(campaign.id)

    if (campaignId) {
      nodes.campaign = await upsertNode(client, "campaign", campaignId, null)

      await createEdge(client, nodes.campaign, nodes.impression, "CONTAINS")
    }

    if (Array.isArray(graph.evidence)) {
      for (const rawEvidence of graph.evidence) {
        const evidence = asRecord(rawEvidence)
        const evidenceId = safeString(evidence.id)

        if (!evidenceId) continue

        const evidenceHash = safeString(
          evidence.hash ?? evidence.evidence_hash
        )

        const evidenceNode = await upsertNode(
          client,
          "evidence",
          evidenceId,
          evidenceHash
        )

        await createEdge(
          client,
          nodes.impression,
          evidenceNode,
          "VERIFIED_BY"
        )
      }
    }

    const merkleRoot = safeString(merkle.root)

    if (merkleRoot) {
      nodes.merkle = await upsertNode(
        client,
        "merkle",
        merkleRoot,
        merkleRoot
      )

      await createEdge(
        client,
        nodes.impression,
        nodes.merkle,
        "INCLUDED_IN"
      )
    }

    const blockHeight = safeString(block.block_height)
    const blockHash = safeString(block.event_hash ?? block.block_hash)

    if (blockHeight && nodes.merkle) {
      nodes.block = await upsertNode(
        client,
        "block",
        blockHeight,
        blockHash
      )

      await createEdge(client, nodes.merkle, nodes.block, "INCLUDED_IN")
    }

    const anchorTx = safeString(anchor.tx ?? anchor.anchor_tx)

    if (anchorTx && nodes.block) {
      nodes.anchor = await upsertNode(client, "anchor", anchorTx, null)

      await createEdge(client, nodes.block, nodes.anchor, "ANCHORED_IN")
    }

    const certId = safeString(
      certificate.certificate_id ?? certificate.id ?? certificate.hash
    )

    if (certId) {
      const certHash = safeString(certificate.hash)

      nodes.certificate = await upsertNode(
        client,
        "certificate",
        certId,
        certHash
      )

      await createEdge(
        client,
        nodes.certificate,
        nodes.impression,
        "DERIVED_FROM"
      )
    }

    await client.query("COMMIT")

    return {
      success: true,
      nodes
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export default buildProofGraphNetwork