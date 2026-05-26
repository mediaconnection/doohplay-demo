import { NextRequest, NextResponse } from "next/server"

import { runProofEngine } from "@/lib/proof/engine"
import { computeScore, getScoreLabel } from "@/lib/proof/score"
import { generateCertificatePdf } from "@/lib/proof/generateCertificatePdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET() {
  return new Response("Method Not Allowed", { status: 405 })
}

const MAX_BODY = 10_000

type EntityType = "event" | "campaign" | "block"

type CertificateInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
}

type RawCertificateInput = {
  hash: string
  entity_id: string
  entity_type: string
}

function isValidInput(body: unknown): body is RawCertificateInput {
  return Boolean(
    body &&
      typeof body === "object" &&
      typeof (body as RawCertificateInput).hash === "string" &&
      typeof (body as RawCertificateInput).entity_id === "string" &&
      typeof (body as RawCertificateInput).entity_type === "string"
  )
}

function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

function normalizeEntityType(value: unknown): EntityType {
  if (value === "campaign") return "campaign"
  if (value === "block") return "block"
  return "event"
}

function normalize(body: RawCertificateInput): CertificateInput {
  return {
    hash: body.hash.trim().toLowerCase(),
    entity_id: body.entity_id.trim(),
    entity_type: normalizeEntityType(body.entity_type)
  }
}

function safeFilename(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "")
  return safe.length ? safe : "certificate"
}

function safeSize(obj: unknown): number {
  try {
    return JSON.stringify(obj).length
  } catch {
    return MAX_BODY + 1
  }
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined

  return Promise.race([
    promise.finally(() => {
      if (timeout) clearTimeout(timeout)
    }),
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("TIMEOUT")), ms)
    })
  ])
}

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json()

    if (!isValidInput(raw)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 })
    }

    const rawHash = raw.hash.trim().toLowerCase()

    if (!isValidHash(rawHash)) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    if (safeSize(raw) > MAX_BODY) {
      return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 })
    }

    const body = normalize({
      ...raw,
      hash: rawHash
    })

    const result = await withTimeout(runProofEngine(body), 5000)

    const score = computeScore(result.layers ?? [])
    const label = getScoreLabel(score)

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000"

    const verifyUrl = `${baseUrl}/explorer/event/${encodeURIComponent(
      body.entity_id
    )}`

    const pdfBuffer = await generateCertificatePdf({
      status: result.valid ? "VALID" : "INVALID",
      score,
      label,
      eventId: body.entity_id,
      hash: body.hash,
      verifyUrl
    })

    return new NextResponse(toArrayBuffer(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${safeFilename(
          body.entity_id
        )}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CERTIFICATE_ROUTE_ERROR", error)

    if (error instanceof Error && error.message === "TIMEOUT") {
      return NextResponse.json({ error: "TIMEOUT" }, { status: 504 })
    }

    return NextResponse.json(
      {
        error: "CERTIFICATE_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}