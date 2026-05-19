// lib/queue.ts

import { redis } from "./redis"

export async function publishEvent(event:any){
  await redis.xadd(
    "events_stream",
    "*",
    "data",
    JSON.stringify(event)
  )
}