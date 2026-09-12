// @ts-nocheck
// /lib/queue/riskQueue.ts

import { Queue } from "bullmq"
import { getRedis } from "@/lib/redis"

const connection = getRedis()

export const riskQueue = new Queue("risk-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})
