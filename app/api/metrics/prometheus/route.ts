export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

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

