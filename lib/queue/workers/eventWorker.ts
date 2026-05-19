import { Worker, Job } from "bullmq"
import { connection } from "../redis"

import { buildCanonicalEvent } from "@/lib/domain/event/canonicalEvent"
import { appendEventToLedger } from "@/lib/domain/ledger/appendEvent"
import { buildProof } from "@/lib/domain/proof/buildProof"

export const eventWorker = new Worker(
  "event-processing",
  async (job: Job) => {
    const { eventId } = job.data

    console.log("🔄 Processing event:", eventId)

    // 1. canonicalização
    const canonical = await buildCanonicalEvent(eventId)

    // 2. append no ledger (hash chain)
    const ledgerEntry = await appendEventToLedger(canonical)

    // 3. gerar prova criptográfica
    await buildProof(ledgerEntry)

    return { success: true }
  },
  { connection }
)