export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0
export const runtime = "nodejs"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function POST(req: Request) {
  try {
    const { logEvent } = await import("@/lib/logging/logEvent")

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Payload inválido" }, { status: 400 })
    }

    const campaignId = safeString(body.campaign_id)
    const playerId = safeString(body.player_id)
    const executionId = safeString(body.execution_id)

    if (!campaignId || !playerId || !executionId) {
      return Response.json({
        error: "Dados obrigatórios ausentes: campaign_id, player_id, execution_id"
      }, { status: 400 })
    }

    await logEvent({
      event_type: "EXECUTION_FINISHED" as any,
      campaign_id: campaignId,
      player_id: playerId,
      execution_id: executionId,
      metadata: {
        played_duration: safeNumber(body.played_duration),
        ended_at: safeString(body.ended_at) ?? new Date().toISOString()
      }
    })

    return Response.json({ ok: true, event_type: "EXECUTION_FINISHED" })
  } catch (error) {
    console.error("EXECUTION_FINISHED_ROUTE_ERROR", error)
    return Response.json({
      error: "Erro ao finalizar execução",
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
