import { createHash } from "crypto";

export function hashPayload(payload: object): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function hashEvent(params: {
  event_type: string;
  source_table: string;
  source_id: string;
  payload_hash: string;
  previous_event_hash?: string | null;
  occurred_at: string;
}): string {
  const baseString = [
    params.event_type,
    params.source_table,
    params.source_id,
    params.payload_hash,
    params.previous_event_hash ?? "",
    params.occurred_at
  ].join("|");

  return createHash("sha256")
    .update(baseString)
    .digest("hex");
}
