export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


export const runtime = "nodejs"

const EventSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({})
})

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function POST(req: NextRequest) {
    const { enqueueEventProcessing } = await import("@/lib/queue/addEventJob")
    const { increment } = await import("@/lib/observability/metrics")
    const { log } = await import("@/lib/observability/logger")

    const { ingestEvent } = await import("@proof-engine/domain/event/ingestEvent")

  const traceId = randomUUID()

  try {
    const body: unknown = await req.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = EventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid event format",
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    increment("events_received")

    const event = await ingestEvent(parsed.data)

    if (!event?.id) {
      throw new Error("Failed to ingest event")
    }

    log("EVENT_RECEIVED", {
      traceId,
      eventId: event.id,
      clientId: parsed.data.clientId,
      type: parsed.data.type
    })

    // Pendência registrada em 2026-09-03 (investigação do circuit-breaker do
    // Upstash): antes disso, uma falha aqui (ex: rate-limit do Upstash) caía
    // no catch genérico abaixo e devolvia 500 cru -- inclusive quando o
    // evento já tinha sido ingerido com sucesso na linha acima. Isolado num
    // try/catch próprio pra devolver 503 + Retry-After, mesmo padrão já
    // aplicado em app/api/verify/[hash]/route.ts (503, Retry-After no header
    // E refletido na mensagem visível, não só no header HTTP).
    try {
      await enqueueEventProcessing(event.id, traceId)
    } catch (queueError) {
      console.error("EVENT_ENQUEUE_ERROR:", {
        traceId,
        eventId: event.id,
        message: getErrorMessage(queueError)
      })

      return NextResponse.json(
        {
          error: "EVENT_QUEUE_UNAVAILABLE",
          event_id: event.id,
          traceId,
          message: "Evento recebido, mas o processamento está temporariamente indisponível. Tente novamente em cerca de 30 segundos."
        },
        { status: 503, headers: { "Retry-After": "30" } }
      )
    }

    return NextResponse.json(
      {
        status: "queued",
        event_id: event.id,
        traceId
      },
      { status: 202 }
    )
  } catch (error) {
    const message = getErrorMessage(error)

    console.error("EVENT_INGEST_ERROR:", {
      traceId,
      message
    })

    return NextResponse.json(
      {
        error: "Internal error",
        traceId,
        message: process.env.NODE_ENV === "development" ? message : undefined
      },
      { status: 500 }
    )
  }
}
