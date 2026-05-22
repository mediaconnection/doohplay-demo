import { db } from "@/lib/db";
import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent";

type ResolveAlertInput = {
  type: string;
  sourceId: string;
  resolvedBy?: string;
};

export async function resolveAlert({
  type,
  sourceId,
  resolvedBy = "system",
}: ResolveAlertInput) {
  const result = await db.query(
    `
    UPDATE alerts
    SET
      status = 'resolved',
      resolved_at = now(),
      resolved_by = $3,
      updated_at = now()
    WHERE
      type = $1
      AND source_id = $2
      AND status = 'open'
    RETURNING id
    `,
    [type, sourceId, resolvedBy]
  );

  if (result.rowCount === 0) {
    return null; // nada para resolver
  }

  const alertId = result.rows[0].id;

  await emitCanonicalEvent({
    event_type: "ALERT_RESOLVED",
    source_table: "alerts",
    source_id: String(alertId),
    payload: {
      type,
      resolvedBy,
    },
  });

  return alertId;
}
