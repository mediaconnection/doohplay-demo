import { pool as db } from "@/lib/db";

type NotifyInput = {
  alertId: string;
  channel: "email" | "whatsapp" | "webhook";
  target: string;
  message: string;
  idempotencyKey: string;
};

export async function notifyAlert({
  alertId,
  channel,
  target,
  message,
  idempotencyKey,
}: NotifyInput) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 🔁 Verificação idempotente
    const existing = await client.query(
      `
      SELECT id, status
      FROM notifications
      WHERE idempotency_key = $1
      `,
      [idempotencyKey]
    );

    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");

      return {
        ok: true,
        duplicated: true,
        status: existing.rows[0].status,
      };
    }

    // 🔔 Envio real entra aqui no futuro

    await client.query(
      `
      INSERT INTO notifications (
        alert_id,
        channel,
        target,
        message,
        status,
        idempotency_key,
        created_at
      )
      VALUES ($1, $2, $3, $4, 'sent', $5, NOW())
      `,
      [alertId, channel, target, message, idempotencyKey]
    );

    await client.query("COMMIT");

    return {
      ok: true,
      duplicated: false,
    };
  } catch (err: any) {
    await client.query("ROLLBACK");

    // ⚠️ Se violou o índice único, é duplicata
    if (err?.code === "23505") {
      return {
        ok: true,
        duplicated: true,
      };
    }

    await client.query(
      `
      INSERT INTO notifications (
        alert_id,
        channel,
        target,
        message,
        status,
        error,
        idempotency_key,
        created_at
      )
      VALUES ($1, $2, $3, $4, 'failed', $5, $6, NOW())
      `,
      [
        alertId,
        channel,
        target,
        message,
        err?.message ?? "unknown error",
        idempotencyKey,
      ]
    );

    throw err;
  } finally {
    client.release();
  }
}
