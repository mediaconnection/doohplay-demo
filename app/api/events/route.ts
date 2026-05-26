export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { enqueueEventProcessing } from "@/lib/queue/addEventJob"
import { increment } from "@/lib/observability/metrics"
import { log } from "@/lib/observability/logger"

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
    const { ingestEvent } = await import("@/lib/domain/event/ingestEvent")

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

    await enqueueEventProcessing(event.id, traceId)

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
