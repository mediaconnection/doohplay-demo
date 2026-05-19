import { db } from "@/lib/db";

type ResolveAlertInput = {
  type: string;
  entityType: string;
  entityId: string;
  metadata?: any;
};

export async function resolveAlert({
  type,
  entityType,
  entityId,
  metadata,
}: ResolveAlertInput) {
  await db.query(
    `
    UPDATE alerts
    SET
      status = 'resolved',
      resolved_at = now(),
      updated_at = now(),
      metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
    WHERE
      type = $1
      AND entity_type = $2
      AND entity_id = $3
      AND status = 'open'
    `,
    [type, entityType, entityId, JSON.stringify(metadata ?? {})]
  );
}
