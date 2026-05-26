export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// /app/api/risk/review/route.ts

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { reviewBlockedClient } from "@/lib/domain/risk/unblock"

/* =========================
   SCHEMA
========================= */

const ReviewSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  decision: z.enum(["approved", "rejected"]),
  reviewedBy: z.string().min(1),
  notes: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }

    const parsed = ReviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await reviewBlockedClient(parsed.data)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (err) {
    console.error("REVIEW_ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

