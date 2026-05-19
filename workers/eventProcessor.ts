// workers/eventProcessor.ts

import { redis } from "@/lib/redis"
import { enrichAudience } from "@/services/audience"
import { appendToChain } from "@/services/proof"
import { buildMerkleRoot } from "@/lib/crypto/merkle"
import { anchorMerkleRoot } from "@/services/anchor"

const BATCH_SIZE = 10

let buffer:string[] = []

export async function startWorker(){

  while(true){

    const res = await redis.xread(
      "BLOCK", 0,
      "STREAMS",
      "events_stream",
      "$"
    )

    if(!res) continue

    const [, messages] = res[0]

    for(const msg of messages){

      const [, fields] = msg
      const raw = fields[1]

      const event = JSON.parse(raw)

      // 1. enrich
      const audience = await enrichAudience(event)

      const enriched = {
        ...event,
        audience
      }

      // 2. chain
      const hash = await appendToChain(enriched)

      buffer.push(hash)

      // 3. batch merkle
      if(buffer.length >= BATCH_SIZE){

        const root = buildMerkleRoot(buffer)

        await anchorMerkleRoot(root)

        buffer = []
      }
    }
  }
}