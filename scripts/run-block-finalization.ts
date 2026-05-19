import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function main() {
  const { Queue } = await import("bullmq")
  const { connection } = await import("../lib/queue/redis")

  const queue = new Queue("block-finalization", {
    connection
  })

  const job = await queue.add("manual", {
    triggered_at: new Date().toISOString()
  })

  console.log("🚀 Job enviado:", job.id)

  await queue.close()
}

main().catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})