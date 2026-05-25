export const dynamic = 'force-dynamic';
// /app/api/risk/evaluate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { RiskSchema } from "@/lib/domain/risk/schema"
import { autoBlockClient } from "@/lib/domain/risk/engine"
import { z } from "zod"

/* =========================
   BODY SCHEMA (STRONG)
========================= */

const BodySchema = z.object({
  clientId: z.coerce.number().int().positive(),
  risk: RiskSchema
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    /* =========================
       VALIDATION (ZOD SAFE)
    ========================= */

    const parsedBody = BodySchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsedBody.error.flatten()
        },
        { status: 400 }
      )
    }

    const { clientId, risk } = parsedBody.data

    /* =========================
       EXECUTION
    ========================= */

    const result = await autoBlockClient(clientId, risk)

    return NextResponse.json({
      success: true,
      riskLevel: risk.riskLevel,
      result
    })

  } catch (err: any) {

    console.error("RISK_EVALUATE_ERROR:", err)

    return NextResponse.json(
      {
        error: "Internal error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : undefined
      },
      { status: 500 }
    )
  }
}
