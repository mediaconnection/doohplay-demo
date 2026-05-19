/* =========================
   ALERT DISPATCH
========================= */

type AlertPayload = {
  client_id: number
  risk_score: number
  risk_label: string
  alerts: string[]
}

export async function dispatchAlerts(payload: AlertPayload) {
  try {
    /* =========================
       1. RULES
    ========================= */

    if (payload.risk_score < 70) {
      return { triggered: false }
    }

    /* =========================
       2. WEBHOOK
    ========================= */

    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    }

    /* =========================
       3. LOG (opcional DB)
    ========================= */

    console.log("🚨 ALERT TRIGGERED:", payload)

    return { triggered: true }

  } catch (err) {
    console.error("Alert dispatch error:", err)
    return { triggered: false }
  }
}