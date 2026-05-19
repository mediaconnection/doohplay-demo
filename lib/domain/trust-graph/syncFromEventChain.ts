import { pool } from "@/lib/db"

type EventRow = {
  event_id: string
  event_hash: string
  previous_event_hash: string | null
  device_id: string | null
  campaign_id: string | null
  event_type: string | null
  occurred_at: string | Date | null
  payload: Record<string, unknown> | null
}

type EventIdRow = {
  event_id: string
}

type NodeType = "event" | "device" | "campaign"

type EdgeType =
  | "event_previous"
  | "event_device"
  | "event_campaign"
  | "device_campaign"

type EdgeRisk = "LOW" | "MEDIUM" | "HIGH"

function makeEventNodeId(eventId: string): string {
  return `event:${eventId}`
}

function makeDeviceNodeId(deviceId: string): string {
  return `device:${deviceId}`
}

function makeCampaignNodeId(campaignId: string): string {
  return `campaign:${campaignId}`
}

function safeDate(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function upsertNode(input: {
  id: string
  nodeType: NodeType
  refId: string
  label: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await pool.query(
    `
    insert into public.trust_graph_nodes (
      id,
      node_type,
      ref_id,
      label,
      metadata,
      updated_at
    )
    values ($1, $2, $3, $4, $5::jsonb, now())
    on conflict (id)
    do update set
      label = excluded.label,
      metadata = excluded.metadata,
      updated_at = now()
    `,
    [
      input.id,
      input.nodeType,
      input.refId,
      input.label,
      JSON.stringify(input.metadata ?? {})
    ]
  )
}

async function upsertEdge(input: {
  sourceId: string
  targetId: string
  edgeType: EdgeType
  weight?: number
  risk?: EdgeRisk
  metadata?: Record<string, unknown>
}): Promise<void> {
  await pool.query(
    `
    insert into public.trust_graph_edges (
      source_id,
      target_id,
      edge_type,
      weight,
      risk,
      metadata
    )
    values ($1, $2, $3, $4, $5, $6::jsonb)
    on conflict (source_id, target_id, edge_type)
    do update set
      weight = excluded.weight,
      risk = excluded.risk,
      metadata = excluded.metadata
    `,
    [
      input.sourceId,
      input.targetId,
      input.edgeType,
      input.weight ?? 1,
      input.risk ?? "LOW",
      JSON.stringify(input.metadata ?? {})
    ]
  )
}

async function findEventIdByHash(
  previousEventHash: string
): Promise<string | null> {
  const res = await pool.query(
    `
    select event_id::text as event_id
    from public.event_chain
    where lower(replace(event_hash, '0x', '')) =
          lower(replace($1, '0x', ''))
    limit 1
    `,
    [previousEventHash]
  )

  const rows = res.rows as EventIdRow[]

  return rows[0]?.event_id ?? null
}

export async function syncTrustGraphFromEventChain(limit = 5000) {
  const eventsRes = await pool.query(
    `
    select
      event_id::text as event_id,
      event_hash,
      previous_event_hash,
      device_id,
      campaign_id,
      event_type,
      occurred_at,
      payload
    from public.event_chain
    order by occurred_at asc nulls last, created_at asc nulls last
    limit $1
    `,
    [limit]
  )

  const events = eventsRes.rows as EventRow[]

  for (const event of events) {
    const eventNodeId = makeEventNodeId(event.event_id)

    await upsertNode({
      id: eventNodeId,
      nodeType: "event",
      refId: event.event_id,
      label: event.event_type || `Event ${event.event_id.slice(0, 8)}`,
      metadata: {
        event_hash: event.event_hash,
        previous_event_hash: event.previous_event_hash,
        event_type: event.event_type,
        occurred_at: safeDate(event.occurred_at),
        payload: event.payload ?? {}
      }
    })

    if (event.device_id) {
      const deviceNodeId = makeDeviceNodeId(event.device_id)

      await upsertNode({
        id: deviceNodeId,
        nodeType: "device",
        refId: event.device_id,
        label: `Device ${event.device_id}`,
        metadata: {}
      })

      await upsertEdge({
        sourceId: eventNodeId,
        targetId: deviceNodeId,
        edgeType: "event_device",
        weight: 1,
        risk: "LOW",
        metadata: {
          event_id: event.event_id
        }
      })
    }

    if (event.campaign_id) {
      const campaignNodeId = makeCampaignNodeId(event.campaign_id)

      await upsertNode({
        id: campaignNodeId,
        nodeType: "campaign",
        refId: event.campaign_id,
        label: `Campaign ${event.campaign_id}`,
        metadata: {}
      })

      await upsertEdge({
        sourceId: eventNodeId,
        targetId: campaignNodeId,
        edgeType: "event_campaign",
        weight: 1,
        risk: "LOW",
        metadata: {
          event_id: event.event_id
        }
      })

      if (event.device_id) {
        await upsertEdge({
          sourceId: makeDeviceNodeId(event.device_id),
          targetId: campaignNodeId,
          edgeType: "device_campaign",
          weight: 1,
          risk: "LOW",
          metadata: {
            via_event_id: event.event_id
          }
        })
      }
    }

    if (event.previous_event_hash) {
      const previousEventId = await findEventIdByHash(event.previous_event_hash)

      if (previousEventId) {
        await upsertEdge({
          sourceId: makeEventNodeId(previousEventId),
          targetId: eventNodeId,
          edgeType: "event_previous",
          weight: 1,
          risk: "LOW",
          metadata: {
            linked_by: "previous_event_hash"
          }
        })
      }
    }
  }

  return {
    ok: true,
    total_events: events.length
  }
}