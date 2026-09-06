export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function POST(req: NextRequest) {
  // Imports dinâmicos — evitam execução durante o build
  const { RiskSchema } = await import("@proof-engine/domain/risk/schema")
  const { autoBlockClient } = await import("@proof-engine/domain/risk/engine")

  // BodySchema definido aqui pois depende de RiskSchema (import dinâmico)
  const BodySchema = z.object({
    clientId: z.coerce.number().int().positive(),
    risk: RiskSchema,
  })

  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsedBody = BodySchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { clientId, risk } = parsedBody.data

    const result = await autoBlockClient(clientId, risk)

    return NextResponse.json({
      success: true,
      riskLevel: risk.riskLevel,
      result,
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error("RISK_EVALUATE_ERROR:", error)
    return NextResponse.json(
      {
        error: "Internal error",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}