import { Worker, Job } from "bullmq"
import { connection } from "../connection"

import { shouldSendAlerts } from "@/lib/domain/alerts/shouldSendAlert"
import { saveAlerts } from "@/lib/domain/alerts/saveAlerts"
import { sendSlackAlert } from "@/lib/integrations/slack/sendAlert"
import { formatAlertMessage } from "@/lib/domain/alerts/formatAlertMessage"

type JobData = {
  campaignId: string
  alerts: any[]
}

export const alertWorker = new Worker(
  "alerts",
  async (job: Job<JobData>) => {
    const { campaignId, alerts } = job.data

    if (!alerts?.length) return

    const newAlerts = await shouldSendAlerts(
      campaignId,
      alerts
    )

    if (newAlerts.length === 0) return

    await saveAlerts(campaignId, newAlerts)

    const message = formatAlertMessage(
      campaignId,
      newAlerts
    )

    await sendSlackAlert(message)

    console.log("✅ Alerts processed:", {
      campaignId,
      count: newAlerts.length
    })
  },
  {
    connection,
    concurrency: 5, // 🔥 escala
  }
)

// 🔴 logs úteis
alertWorker.on("failed", (job, err) => {
  console.error("❌ Job failed:", job?.id, err)
})

alertWorker.on("completed", job => {
  console.log("🎉 Job done:", job.id)
})