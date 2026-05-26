export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export const runtime = "nodejs"

type ExecutionFinishedBody = {
  campaign_id?: unknown
  player_id?: unknown
  execution_id?: unknown
  played_duration?: unknown
  ended_at?: unknown
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

function resolveExecutionFinishedType(): string {
  const types = LOG_EVENT_TYPES as Record<string, string>

  return (
    types.EXECUTION_FINISHED ??
    types.EXECUTION_FINISH ??
    types.PLAYBACK_FINISHED ??
    "EXECUTION_FINISHED"
  )
}

export async function POST(req: Request) {
    const { logEvent } = await import("@/lib/logging/logEvent")
    const { LOG_EVENT_TYPES } = await import("@/lib/logging/logEventTypes")

  try {
    const body = (await req.json().catch(() => null)) as
      | ExecutionFinishedBody
      | null

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Payload inválido" }, { status: 400 })
    }

    const campaignId = safeString(body.campaign_id)
    const playerId = safeString(body.player_id)
    const executionId = safeString(body.execution_id)

    if (!campaignId || !playerId || !executionId) {
      return Response.json(
        {
          error:
            "Dados obrigatórios ausentes: campaign_id, player_id, execution_id"
        },
        { status: 400 }
      )
    }

    const eventType = resolveExecutionFinishedType()

    await logEvent({
      type: eventType,
      metadata: {
        campaign_id: campaignId,
        player_id: playerId,
        execution_id: executionId,
        played_duration: safeNumber(body.played_duration),
        ended_at: safeString(body.ended_at) ?? new Date().toISOString()
      }
    })

    return Response.json({
      ok: true,
      event_type: eventType
    })
  } catch (error) {
    console.error("EXECUTION_FINISHED_ROUTE_ERROR", error)

    return Response.json(
      {
        error: "Erro ao finalizar execução",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
