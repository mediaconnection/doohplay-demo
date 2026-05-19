import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent"

export async function persistEvent(event: any) {
  return emitCanonicalEvent({
    event_type: event.event_type || event.type || "GENERIC_EVENT",
    source_table: event.source_table || "events",
    source_id: event.source_id || event.id,
    payload: event
  })
}
