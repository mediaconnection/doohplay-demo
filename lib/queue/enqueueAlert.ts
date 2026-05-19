import { alertQueue } from "./alertQueue"
import { Alert } from "@/lib/domain/alerts/types"

export async function enqueueAlerts(
  campaignId: string,
  alerts: Alert[]
) {
  if (!alerts.length) return

  const hasHigh = alerts.some(a => a.severity === "high")

  await alertQueue.add(
    "process-alerts",
    {
      campaignId,
      alerts
    },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false,
      priority: hasHigh ? 1 : 5 // 🔥 prioridade
    }
  )
}