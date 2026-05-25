// @ts-nocheck
import { Queue } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL!)

export const dlq = new Queue("risk-dlq", {
  connection
})
