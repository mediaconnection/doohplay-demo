import { NextResponse } from "next/server"
import IORedis from "ioredis"

const redis = new IORedis(process.env.REDIS_URL!)

export async function GET() {
  const keys = await redis.keys("metrics:counter:*")

  let output = ""

  for (const key of keys) {
    const value = await redis.get(key)
    const metric = key.replace("metrics:counter:", "")

    output += `${metric} ${value}\n`
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain"
    }
  })
}