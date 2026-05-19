import { Queue } from "bullmq"
import { connection } from "./connection"

export const alertQueue = new Queue("alerts", {
  connection
})