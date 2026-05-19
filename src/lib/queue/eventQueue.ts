import { Worker } from "bullmq"
import { connection } from "./connection"
import { writeEvent } from "@/lib/ledger/writeEvent"

export const eventWorker = new Worker(
  "event-queue",

  async (job) => {

    if (job.name === "write-event") {

      await writeEvent({
        payload: job.data.payload
      })

    }

  },

  {
    connection,
    concurrency: 5 // 🔥 ajustável
  }
)