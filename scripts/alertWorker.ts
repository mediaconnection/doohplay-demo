import { Worker } from "bullmq";
import { notifyAlert } from "../src/lib/notifications/notifyAlert";
import { shouldNotifyAlert } from "../src/core/alerts/shouldNotifyAlert";
import { db } from "../src/lib/db";

const COOLDOWN_MINUTES = 15;

export const alertWorker = new Worker(
  "alerts",
  async job => {
    const { alertId, channel, target, message } = job.data ?? {};

    if (!alertId || !channel || !target || !message) {
      console.warn("⚠️ Job inválido — dados incompletos", job.data);
      return;
    }

    console.log("📨 Processando alerta", {
      jobId: job.id,
      alertId,
      channel,
    });

    const { rows } = await db.query(
      `
      SELECT status, last_notified_at, notify_count
      FROM alerts
      WHERE id = $1
      `,
      [alertId]
    );

    const alert = rows[0];

    if (!alert) {
      console.warn("⚠️ Alerta não encontrado", alertId);
      return;
    }

    if (alert.status !== "open") {
      console.log("ℹ️ Alerta não está aberto", alertId);
      return;
    }

    const canNotify = shouldNotifyAlert({
      lastNotifiedAt: alert.last_notified_at,
      cooldownMinutes: COOLDOWN_MINUTES,
    });

    if (!canNotify) {
      console.log("⏳ Cooldown ativo — ignorando", alertId);
      return;
    }

    await notifyAlert({
      alertId,
      channel,
      target,
      message,
    });

    await db.query(
      `
      UPDATE alerts
      SET
        last_notified_at = now(),
        notify_count = notify_count + 1,
        updated_at = now()
      WHERE id = $1
      `,
      [alertId]
    );

    console.log("✅ Alerta enviado com sucesso", alertId);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
