/**
 * DOOHPLAY Event Worker
 * ---------------------
 * Processa eventos da fila (BullMQ)
 */

// Must be the first import — loads .env.local into process.env.
// Note: static imports are hoisted by esbuild/tsx, so this config() call runs
// after module-level code in imported files. The --env-file=.env.local flag in
// the npm script is what guarantees DATABASE_URL is available at import time.
import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })

import { eventWorker } from "./src/lib/queue/eventWorker"
import { aggregatorWorker, scheduleAggregatorJob } from "./lib/queue/workers/aggregatorWorker"

// 🔥 START
console.log("🟢 DOOHPLAY Event Worker started")

// 🔗 PROOFCHAIN AGGREGATOR — schedule periodic proof pipeline (every 5 min)
scheduleAggregatorJob().catch((err) => {
  console.error("❌ Failed to schedule proofchain aggregator:", err)
})

// 📊 LOGS DE PROCESSAMENTO
eventWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.name} (${job.id})`)
})

eventWorker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.name} (${job?.id})`, err)
})

eventWorker.on("active", (job) => {
  console.log(`⚡ Processing job: ${job.name} (${job.id})`)
})

// 🛑 GRACEFUL SHUTDOWN (CRÍTICO)
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down worker...`)

  try {
    await Promise.all([eventWorker.close(), aggregatorWorker.close()])
    console.log("✅ Workers closed gracefully")
    process.exit(0)
  } catch (err) {
    console.error("❌ Error during shutdown", err)
    process.exit(1)
  }
}

// 🔥 CAPTURA SINAIS DO SISTEMA
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

// 🔥 CAPTURA ERROS GLOBAIS
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
})

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason)
})