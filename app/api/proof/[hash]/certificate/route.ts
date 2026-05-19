import fs from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import { generateCertificate } from "@/lib/domain/proof/generateCertificate"
import { verifyHash } from "@/lib/domain/proof/service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type VerifyHashResult = {
  valid?: boolean
  hash?: string | null
  issued_at?: string | null
  expires_at?: string | null
  certificate_authority?: string | null
  legal_basis?: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function safeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  )
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash) {
      return NextResponse.json(
        { error: "INVALID_HASH" },
        { status: 400 }
      )
    }

    const data = (await verifyHash(hash)) as VerifyHashResult | null

    if (!data || data.valid !== true) {
      return NextResponse.json(
        { error: "NOT_FOUND" },
        { status: 404 }
      )
    }

    const verifyUrl = `${getBaseUrl()}/verify/${encodeURIComponent(hash)}`

    const generatedPath = await generateCertificate({
      hash: safeString(data.hash, hash),
      issuedAt: safeString(
        data.issued_at,
        new Date().toISOString()
      ),
      expiresAt: safeString(data.expires_at),
      verifyUrl
    })

    const resolvedFilePath = path.resolve(generatedPath)

    if (!fs.existsSync(resolvedFilePath)) {
      return NextResponse.json(
        { error: "CERTIFICATE_FILE_NOT_FOUND" },
        { status: 404 }
      )
    }

    const file = fs.readFileSync(resolvedFilePath)

    return new Response(toArrayBuffer(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${hash}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("PROOF_CERTIFICATE_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PROOF_CERTIFICATE_FAILED",
        detail:
          error instanceof Error
            ? error.message
            : String(error)
      },
      { status: 500 }
    )
  }
}