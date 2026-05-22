export type CanonicalEvent = {
  event_id: string;
  event_type: string;

  source_table: string;
  source_id: string;

  device_id?: string | null;
  campaign_id?: string | null;

  occurred_at: string; // ISO 8601 UTC

  payload_hash: string;
  previous_event_hash?: string | null;
  event_hash: string;

  signature: string;
};
