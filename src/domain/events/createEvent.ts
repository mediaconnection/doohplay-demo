import { randomUUID } from "crypto";

export type CanonicalEvent = {
  schema_version: "1.0";
  event_id: string;
  occurred_at: string;
  event_type: string;
  actor: {
    type: "SYSTEM" | "USER" | "SERVICE";
    id: string;
  };
  context: {
    environment: "production" | "staging" | "development";
    application: string;
  };
  payload: Record<string, unknown>;
};

export function createCanonicalEvent(
  input: Omit<CanonicalEvent, "schema_version" | "event_id" | "occurred_at">
): CanonicalEvent {
  return {
    schema_version: "1.0",
    event_id: randomUUID(),
    occurred_at: new Date().toISOString(),
    ...input
  };
}
