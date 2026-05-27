/**
 * DOOHPLAY Event Worker
 * ---------------------
 * Processa eventos da fila (BullMQ)
 */

import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })

import { getEventWorker } from "./lib/queue/workers/eventWorker"
import { getProofWorker } from "./lib/queue/workers/proofWorker"
import { getAggregatorWorker, scheduleAggregatorJob } from "./lib/queue/workers/alertWorker"
import { getRiskWorker } from "./lib/queue/workers/riskWorker"
import { getAlertWorker } from "./lib/queue/workers/blockWorker"

console.log("🟢 DOOHPLAY Event Worker started")

// Inicializa workers
const eventWorker = getEventWorker()
console.log("✅ eventWorker started")

const proofWorker = getProofWorker()
console.log("✅ proofWorker started")

const aggregatorWorker = getAggregatorWorker()
console.log("✅ aggregatorWorker started")

const riskWorker = getRiskWorker()
console.log("✅ riskWorker started")

const alertWorker = getAlertWorker()
console.log("✅ alertWorker started")

// Agenda o job de agregação do Proofchain (a cada 5 minutos)
scheduleAggregatorJob()
  .then(() => console.log("✅ aggregatorJob scheduled"))
  .catch((err) => console.error("❌ Failed to schedule aggregator:", err))

// Logs de processamento
eventWorker.on("completed", (job) => console.log(`✅ eventWorker completed: ${job.id}`))
eventWorker.on("failed", (job, err) => console.error(`❌ eventWorker failed: ${job?.id}`, err.message))
proofWorker.on("completed", (job) => console.log(`✅ proofWorker completed: ${job.id}`))
proofWorker.on("failed", (job, err) => console.error(`❌ proofWorker failed: ${job?.id}`, err.message))
aggregatorWorker.on("completed", (job) => console.log(`✅ aggregatorWorker completed: ${job.id}`))
aggregatorWorker.on("failed", (job, err) => console.error(`❌ aggregatorWorker failed: ${job?.id}`, err.message))

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`🛑 Received ${signal}. Shutting down...`)
  await Promise.allSettled([
    eventWorker.close(),
    proofWorker.close(),
    aggregatorWorker.close(),
    riskWorker.close(),
    alertWorker.close(),
  ])
  console.log("✅ Workers closed")
  process.exit(0)
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("uncaughtException", (err) => console.error("💥 Uncaught Exception:", err))
process.on("unhandledRejection", (reason) => console.error("💥 Unhandled Rejection:", reason))