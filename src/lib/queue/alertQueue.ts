import { Queue } from "bullmq";
import { redis } from "./redis";

export const alertQueue = new Queue("alerts", {
  connection: redis,
});
