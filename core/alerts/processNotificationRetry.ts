// @ts-nocheck
import { db } from "@/lib/db";
import { calculateBackoff } from "./retryPolicy";
import { notifyAlert } from "./notifyAlert";

const MAX_ATTEMPTS = 5;
const BASE_DELAY = 2_000;
const MAX_DELAY = 60_000;

export async function processNotificationRetry(notificationId: string) {
  type NotificationRow = {
    attempt: number
    alert_id: string
    channel: "email" | "whatsapp" | "webhook"
    target: string
    message: string
    idempotency_key: string
  }

  const { rows } = await db.query<NotificationRow>(
    `
    SELECT *
    FROM notifications
    WHERE id = $1
    `,
    [notificationId]
  );

  if (rows.length === 0) return;

  const n = rows[0];

  if (n.attempt >= MAX_ATTEMPTS) {
    await db.query(
      `
      UPDATE notifications
      SET status = 'dead'
      WHERE id = $1
      `,
      [notificationId]
    );
    return;
  }

  const nextAttempt = n.attempt + 1;
  const delay = calculateBackoff(
    nextAttempt,
    BASE_DELAY,
    MAX_DELAY
  );

  try {
    await notifyAlert({
      alertId: n.alert_id,
      channel: n.channel,
      target: n.target,
      message: n.message,
      idempotencyKey: n.idempotency_key,
    });

    await db.query(
      `
      UPDATE notifications
      SET status = 'sent',
          last_attempt_at = NOW()
      WHERE id = $1
      `,
      [notificationId]
    );
  } catch (err: any) {
    await db.query(
      `
      UPDATE notifications
      SET
        attempt = $2,
        status = 'retrying',
        last_attempt_at = NOW(),
        next_retry_at = NOW() + INTERVAL '${delay} milliseconds',
        error = $3
      WHERE id = $1
      `,
      [
        notificationId,
        nextAttempt,
        err.message ?? "retry failed",
      ]
    );
  }
}

