// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"

import { runProofEngine } from "@/lib/proof/engine"
import { computeScore, getScoreLabel } from "@/lib/proof/score"

type EngineLayer = {
  name?: string
  valid?: boolean
  details?: Record<string, unknown> | null
  meta?: Record<string, unknown> | null
}

type ScoreLayer = Parameters<typeof computeScore>[0][number]

function getLayers(result: unknown): EngineLayer[] {
  if (!result || typeof result !== "object") return []

  const record = result as {
    details?: unknown
    layers?: unknown
  }

  if (Array.isArray(record.details)) return record.details as EngineLayer[]
  if (Array.isArray(record.layers)) return record.layers as EngineLayer[]

  return []
}

function findLayer(layers: EngineLayer[], names: string[]): EngineLayer | null {
  return (
    layers.find((layer) => {
      const name = typeof layer.name === "string" ? layer.name.toLowerCase() : ""
      return names.includes(name)
    }) ?? null
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await runProofEngine(body)

    const layers = getLayers(result)

    const signatureLayer = findLayer(layers, ["signature", "icp", "certificate"])
    const merkleLayer = findLayer(layers, ["merkle"])
    const blockchainLayer = findLayer(layers, ["blockchain"])
    const timestampLayer = findLayer(layers, ["timestamp"])

    const scoreInput: ScoreLayer[] = [
      {
        name: "signature",
        valid: signatureLayer?.valid === true,
        weight: 40
      } as ScoreLayer,
      {
        name: "merkle",
        valid: merkleLayer?.valid === true,
        weight: 30
      } as ScoreLayer,
      {
        name: "blockchain",
        valid: blockchainLayer?.valid === true,
        weight: 30
      } as ScoreLayer,
      {
        name: "timestamp",
        valid: timestampLayer?.valid === true,
        weight: 10
      } as ScoreLayer
    ]

    const score = computeScore(scoreInput)
    const label = getScoreLabel(score)

    return NextResponse.json({
      success: true,
      score,
      trust_level: label,
      message: "PDF generation queued"
    })
  } catch (error) {
    console.error("PROOF_CERTIFICATE_ERROR", error)

    return NextResponse.json(
      { error: "CERTIFICATE_ERROR" },
      { status: 500 }
    )
  }
}
