import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"

import { getCertificateByHash } from "@/lib/db/certificates"
import { generatePdfDocument } from "@/lib/pdf/generatePdfDocument"
import { signPdfBuffer } from "@/lib/pdf/signPdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CertificatePayload = {
  subject_type: string
  subject_id: string
  [key: string]: unknown
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function safeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback

  const trimmed = value.trim()
  return trimmed.length ? trimmed : fallback
}

function safePayload(value: unknown, hash: string): CertificatePayload {
  const payload =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {}

  return {
    ...payload,
    subject_type: safeString(payload.subject_type, "event"),
    subject_id: safeString(payload.subject_id, hash)
  }
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
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
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
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const cert = await getCertificateByHash(hash)

    if (!cert) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    const verifyUrl =
      safeString(cert.verify_url) ||
      `${getBaseUrl()}/verify/${encodeURIComponent(hash)}`

    const pdfElement = generatePdfDocument({
      hash: safeString(cert.hash) || safeString(cert.certificate_hash) || hash,
      verifyUrl,
      qrCode: safeString(cert.qr_code, verifyUrl),
      payload: safePayload(cert.payload, hash),
      certificate: {
        issuer: safeString(cert.cert_issuer),
        serial: safeString(cert.cert_serial),
        algorithm: "PKCS7-SHA256",
        signed_at: safeString(cert.created_at, new Date().toISOString())
      },
      tsa: cert.tsa_token
        ? {
            authority: safeString(cert.tsa_authority),
            timestamp: safeString(cert.tsa_timestamp)
          }
        : null
    })

    const pdfBuffer = await renderToBuffer(pdfElement)

    const certPfxPath = process.env.CERT_PFX_PATH
    const certPfxPassword = process.env.CERT_PFX_PASSWORD

    if (!certPfxPath || !certPfxPassword) {
      return new NextResponse(toArrayBuffer(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="proof-${hash}.pdf"`,
          "X-PDF-Signed": "false",
          "Cache-Control": "no-store"
        }
      })
    }

    const pfxBuffer = fs.readFileSync(certPfxPath)
    const signedPdf = signPdfBuffer(pdfBuffer, pfxBuffer, certPfxPassword)

    return new NextResponse(toArrayBuffer(signedPdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proof-${hash}.pdf"`,
        "X-PDF-Signed": "true",
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("CERTIFICATE_PDF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "CERTIFICATE_PDF_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}