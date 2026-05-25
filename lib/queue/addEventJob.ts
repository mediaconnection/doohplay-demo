// @ts-nocheck
import { riskQueue } from "./riskQueue"

/* =========================
   PRODUCER
========================= */

export async function enqueueEventProcessing(
  eventId: number,
  traceId?: string
) {
  return riskQueue.add("process-event", {
    eventId,
    traceId
  })
}
