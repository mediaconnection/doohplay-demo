import { logEvent } from "@/lib/logging/logEvent"
import { LOG_EVENT_TYPES } from "@/lib/logging/logEventTypes"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ExecutionStartedBody = {
  campaign_id?: unknown
  player_id?: unknown
  execution_id?: unknown
  media_id?: unknown
  duration?: unknown
  started_at?: unknown
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

function resolveExecutionStartedType(): string {
  const types = LOG_EVENT_TYPES as Record<string, string>

  return (
    types.EXECUTION_STARTED ??
    types.EXECUTION_START ??
    types.PLAYBACK_STARTED ??
    types.PLAYBACK_START ??
    "EXECUTION_STARTED"
  )
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | ExecutionStartedBody
      | null

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Payload inválido" }, { status: 400 })
    }

    const campaignId = safeString(body.campaign_id)
    const playerId = safeString(body.player_id)
    const executionId = safeString(body.execution_id)
    const mediaId = safeString(body.media_id)

    if (!campaignId || !playerId || !executionId || !mediaId) {
      return Response.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    const eventType = resolveExecutionStartedType()

    await logEvent({
      type: eventType,
      metadata: {
        campaign_id: campaignId,
        player_id: playerId,
        execution_id: executionId,
        media_id: mediaId,
        duration: safeNumber(body.duration),
        started_at: safeString(body.started_at) ?? new Date().toISOString()
      }
    })

    return Response.json({
      ok: true,
      event_type: eventType
    })
  } catch (error) {
    console.error("EXECUTION_STARTED_ROUTE_ERROR", error)

    return Response.json(
      {
        error: "Erro ao iniciar execução",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}