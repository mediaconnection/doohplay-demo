export { connection } from "./connection"

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function main() {
  const { Queue } = await import("bullmq")
  const IORedis = (await import("ioredis")).default

  // conexão direta com Redis
  const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379
  })

  const queue = new Queue("block-finalization", {
    connection
  })

  const job = await queue.add("manual", {
    triggered_at: new Date().toISOString()
  })

  console.log("🚀 Job enviado:", job.id)

  await queue.close()
  await connection.quit()
}

main().catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})