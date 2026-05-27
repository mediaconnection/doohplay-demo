/**
 * DOOHPLAY Event Worker
 * ---------------------
 * Processa eventos da fila (BullMQ)
 */

import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })

import { eventWorker } from "./lib/queue/eventWorker"
import { getProofWorker } from "./lib/queue/workers/proofWorker"
import { getAlertWorker } from "./lib/queue/workers/alertWorker"
import { getRiskWorker } from "./lib/queue/workers/riskWorker"
import { getBlockWorker } from "./lib/queue/workers/blockWorker"

// 🔥 START
console.log("🟢 DOOHPLAY Event Worker started")

// Inicializa todos os workers
const proofWorker = getProofWorker()
console.log("✅ proofWorker started")

const alertWorker = getAlertWorker()
console.log("✅ alertWorker started")

const riskWorker = getRiskWorker()
console.log("✅ riskWorker started")

const blockWorker = getBlockWorker()
console.log("✅ blockWorker started")

// 📊 LOGS DE PROCESSAMENTO — eventWorker
eventWorker.on("completed", (job) => {
  console.log(`✅ eventWorker job completed: ${job.name} (${job.id})`)
})

eventWorker.on("failed", (job, err) => {
  console.error(`❌ eventWorker job failed: ${job?.name} (${job?.id})`, err)
})

eventWorker.on("active", (job) => {
  console.log(`⚡ eventWorker processing job: ${job.name} (${job.id})`)
})

// 📊 LOGS — proofWorker
proofWorker.on("completed", (job) => {
  console.log(`✅ proofWorker job completed: ${job.id}`)
})

proofWorker.on("failed", (job, err) => {
  console.error(`❌ proofWorker job failed: ${job?.id}`, err.message)
})

// 🛑 GRACEFUL SHUTDOWN
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down workers...`)
  try {
    await Promise.allSettled([
      eventWorker.close(),
      proofWorker.close(),
      alertWorker.close(),
      riskWorker.close(),
      blockWorker.close(),
    ])
    console.log("✅ Workers closed gracefully")
    process.exit(0)
  } catch (err) {
    console.error("❌ Error during shutdown", err)
    process.exit(1)
  }
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
})

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason)
})