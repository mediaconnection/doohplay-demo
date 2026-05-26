export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { resolveAlert } from "@/core/alerts/resolveAlert"

export const runtime = "nodejs"

type HeartbeatBody = {
  player_id?: unknown
  ip?: unknown
  version?: unknown
  uptime_seconds?: unknown
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function resolvePlayerHeartbeatType(): string {
  const types = LOG_EVENT_TYPES as Record<string, string>

  return types.PLAYER_HEARTBEAT ?? types.HEARTBEAT ?? "PLAYER_HEARTBEAT"
}

function getClientIp(req: Request, fallbackIp: string | null): string | null {
  const forwardedFor = safeString(req.headers.get("x-forwarded-for"))
  const realIp = safeString(req.headers.get("x-real-ip"))
  const raw = forwardedFor ?? realIp ?? fallbackIp

  if (!raw) return null

  return raw.includes(",") ? raw.split(",")[0]?.trim() || null : raw.trim()
}

export async function POST(req: Request) {
    const { logEvent } = await import("@/lib/logging/logEvent")
    const { LOG_EVENT_TYPES } = await import("@/lib/logging/logEventTypes")
    const { pool } = await import("@/lib/db")

  try {
    const body = (await req.json().catch(() => null)) as HeartbeatBody | null

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Payload inválido" }, { status: 400 })
    }

    const playerId = safeString(body.player_id)
    const ip = getClientIp(req, safeString(body.ip))
    const version = safeString(body.version)
    const uptimeSeconds = safeNumber(body.uptime_seconds)

    if (!playerId) {
      return Response.json({ error: "player_id é obrigatório" }, { status: 400 })
    }

    const now = new Date()
    const heartbeatAt = now.toISOString()
    const eventType = resolvePlayerHeartbeatType()

    const updateResult = await pool.query(
      `
      UPDATE public.players
      SET
        status = 'online',
        last_seen = $2,
        version = COALESCE($3, version),
        ip_address = COALESCE($4, ip_address)
      WHERE id::text = $1
      `,
      [playerId, now, version, ip]
    )

    await logEvent({
      type: eventType,
      metadata: {
        player_id: playerId,
        ip,
        version,
        uptime_seconds: uptimeSeconds,
        heartbeat_at: heartbeatAt,
        player_updated: (updateResult.rowCount ?? 0) > 0
      }
    })

    await resolveAlert({
      type: "PLAYER_OFFLINE",
      sourceId: playerId,
      resolvedBy: "heartbeat"
    })

    return Response.json({
      ok: true,
      event_type: eventType,
      player_id: playerId,
      heartbeat_at: heartbeatAt,
      player_updated: (updateResult.rowCount ?? 0) > 0
    })
  } catch (error) {
    console.error("PLAYER_HEARTBEAT_ROUTE_ERROR", error)

    return Response.json(
      {
        error: "Erro ao registrar heartbeat do player",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
