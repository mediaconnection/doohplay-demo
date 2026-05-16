import { logEvent } from "@/lib/logging/logEvent"
import { LOG_EVENT_TYPES } from "@/lib/logging/logEventTypes"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ExecutionFailedBody = {
  campaign_id?: unknown
  player_id?: unknown
  execution_id?: unknown
  error_code?: unknown
  error_message?: unknown
  stack?: unknown
  failed_at?: unknown
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function resolveExecutionFailedType(): string {
  const types = LOG_EVENT_TYPES as Record<string, string>

  return (
    types.EXECUTION_FAILED ??
    types.EXECUTION_FAIL ??
    types.PLAYBACK_FAILED ??
    "EXECUTION_FAILED"
  )
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | ExecutionFailedBody
      | null

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Payload inválido" }, { status: 400 })
    }

    const campaignId = safeString(body.campaign_id)
    const playerId = safeString(body.player_id)
    const executionId = safeString(body.execution_id)
    const errorCode = safeString(body.error_code)

    const errorMessage = safeString(body.error_message)
    const stack = safeString(body.stack)
    const failedAt = safeString(body.failed_at) ?? new Date().toISOString()

    if (!campaignId || !playerId || !executionId || !errorCode) {
      return Response.json(
        {
          error:
            "Dados obrigatórios ausentes: campaign_id, player_id, execution_id, error_code"
        },
        { status: 400 }
      )
    }

    const eventType = resolveExecutionFailedType()

    await logEvent({
      type: eventType,
      metadata: {
        campaign_id: campaignId,
        player_id: playerId,
        execution_id: executionId,
        error_code: errorCode,
        error_message: errorMessage,
        stack,
        failed_at: failedAt
      }
    })

    return Response.json({
      ok: true,
      event_type: eventType
    })
  } catch (error) {
    console.error("EXECUTION_FAILED_ROUTE_ERROR", error)

    return Response.json(
      {
        error: "Erro ao registrar falha de execução",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}