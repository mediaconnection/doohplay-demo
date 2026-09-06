import { Worker, type Job } from "bullmq"
import { getRedis } from "@/lib/redis"
import { shouldSendAlerts } from "@proof-engine/domain/alerts/shouldSendAlert"
import { saveAlerts } from "@proof-engine/domain/alerts/saveAlerts"
import { sendSlackAlert } from "@/lib/integrations/slack/sendAlert"
import { formatAlertMessage } from "@proof-engine/domain/alerts/formatAlertMessage"
import { attachRateLimitCircuitBreaker } from "@/lib/queue/rateLimitCircuitBreaker"

type JobData = {
  campaignId: string
  alerts: unknown[]
}

let _alertWorker: Worker | null = null

export function getAlertWorker(): Worker {
  if (!_alertWorker) {
    _alertWorker = new Worker(
      "alerts",
      async (job: Job<JobData>) => {
        const { campaignId, alerts } = job.data

        if (!alerts?.length) return

        const newAlerts = await shouldSendAlerts(campaignId, alerts)

        if (newAlerts.length === 0) return

        await saveAlerts(campaignId, newAlerts)

        const message = formatAlertMessage(campaignId, newAlerts)
        await sendSlackAlert(message)

        console.log("✅ Alerts processed:", {
          campaignId,
          count: newAlerts.length,
        })
      },
      {
        connection: getRedis(),
        concurrency: 5,
      }
    )

    _alertWorker.on("failed", (job, err) => {
      console.error("❌ Job failed:", job?.id, err)
    })

    _alertWorker.on("completed", (job) => {
      console.log("🎉 Job done:", job.id)
    })

    // Fila "alerts" não tem nenhum produtor real hoje (achado 2026-09-03,
    // enqueueAlert() sem chamador fora de script de teste) -- teto alto.
    attachRateLimitCircuitBreaker(_alertWorker, { label: "alertWorker(blockWorker)", maxDelayMs: 10 * 60_000 })
  }

  return _alertWorker
}

// Proxy para compatibilidade com imports existentes
export const alertWorker = new Proxy({} as Worker, {
  get(_, prop) {
    const w = getAlertWorker()
    const value = w[prop as keyof Worker]
    return typeof value === "function" ? (value as Function).bind(w) : value
  },
})