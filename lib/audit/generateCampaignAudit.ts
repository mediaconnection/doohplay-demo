import { pool } from "@/lib/db"
import { assinarComA1 } from "@/lib/crypto/assinarComA1"
import { generateProof } from "@/lib/proof/generateProof"

type JsonRecord = Record<string, unknown>

type CampaignAuditEventRow = {
  event_hash: string
  created_at: string | Date
  payload: JsonRecord | null
}

type ProofResult = {
  merkle_root?: string | null
  merkle_proof?: unknown[] | null
}

type CampaignAuditPlay = {
  event_hash: string
  screen_id: string | null
  played_at: string
  merkle_root: string | null
  merkle_proof: unknown[] | null
}

type AnchorRow = {
  merkle_root: string | null
  anchored_at: string | Date | null
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject)
  }

  if (value !== null && typeof value === "object") {
    return Object.keys(value as JsonRecord)
      .sort()
      .reduce<JsonRecord>((acc, key) => {
        acc[key] = sortObject((value as JsonRecord)[key])
        return acc
      }, {})
  }

  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value))
}

function toIsoDate(value: string | Date): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString()
  }

  return date.toISOString()
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function worker() {
    while (index < items.length) {
      const current = index
      index += 1
      results[current] = await fn(items[current])
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, items.length || 1)) }).map(
      () => worker()
    )
  )

  return results
}

export async function generateCampaignAudit(
  campaignId: string,
  start: string,
  end: string
) {
  if (!campaignId) {
    throw new Error("campaignId is required")
  }

  if (!isValidDate(start) || !isValidDate(end)) {
    throw new Error("invalid date range")
  }

  try {
    const eventsResult = await pool.query(
      `
      SELECT
        event_hash,
        created_at,
        payload
      FROM public.event_chain
      WHERE payload->>'campaign_id' = $1
        AND created_at >= $2
        AND created_at <= $3
      ORDER BY created_at ASC
      `,
      [campaignId, start, end]
    )

    const events = eventsResult.rows as CampaignAuditEventRow[]

    const proofs: CampaignAuditPlay[] = await mapWithLimit(
      events,
      5,
      async (event): Promise<CampaignAuditPlay> => {
        const proof = (await generateProof(event.event_hash)) as ProofResult | null

        const payload =
          event.payload && typeof event.payload === "object" ? event.payload : {}

        return {
          event_hash: event.event_hash,
          screen_id: safeString(payload.screen_id),
          played_at: toIsoDate(event.created_at),
          merkle_root: proof?.merkle_root ?? null,
          merkle_proof: Array.isArray(proof?.merkle_proof)
            ? proof.merkle_proof
            : null
        }
      }
    )

    const anchorResult = await pool.query(
      `
      SELECT
        merkle_root,
        anchored_at
      FROM public.anchors
      WHERE anchored_at >= $1
        AND anchored_at <= $2
      ORDER BY anchored_at DESC
      LIMIT 1
      `,
      [start, end]
    )

    const anchorRows = anchorResult.rows as AnchorRow[]
    const ledgerAnchor = anchorRows[0] ?? null

    const report = {
      campaign_id: campaignId,
      period: {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString()
      },
      total_plays: proofs.length,
      plays: proofs,
      ledger_anchor: ledgerAnchor
    }

    const payloadString = stableStringify(report)
    const signature = await assinarComA1(payloadString)

    return {
      ...report,
      signature
    }
  } catch (error) {
    console.error("generateCampaignAudit error", error)
    throw new Error("failed to generate campaign audit")
  }
}