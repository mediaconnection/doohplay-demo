import { getCounter } from "./metricsRedis"

/* =========================
   ALERT ENGINE
========================= */

export async function checkAlerts() {
  const blocked = await getCounter("clients_blocked")

  if (blocked > 50) {
    await sendAlert("🚨 High fraud spike detected", {
      blocked
    })
  }
}

/* =========================
   ALERT HANDLER
========================= */

async function sendAlert(message: string, data: any) {
  console.log("[ALERT]", message, data)

  // 👉 futuro:
  // Slack webhook
  // Email
  // PagerDuty
}