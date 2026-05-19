import dotenv from "dotenv"
dotenv.config()

import { createBlock } from "../lib/domain/block/createBlock"

const INTERVAL = Number(process.env.BLOCK_INTERVAL || 10000)

async function loop() {
  console.log("🚀 DOOHPLAY Block Worker started")

  while (true) {
    const start = Date.now()

    try {
      console.log("⛓️ Creating block...")

      const block = await createBlock()

      // ✅ CORREÇÃO CRÍTICA
      if (!block) {
        console.log("⚠️ No pending events")
      } else {
        console.log(JSON.stringify({
          event: "BLOCK_CREATED",
          block_id: block.block_id,
          events: block.total_events,
          merkle_root: block.merkle_root,
          tx_hash: block.tx_hash || null,
          duration_ms: Date.now() - start
        }))
      }

    } catch (err: any) {
      console.error("❌ Block error:", err?.message || err)
    }

    await new Promise((r) => setTimeout(r, INTERVAL))
  }
}

loop()