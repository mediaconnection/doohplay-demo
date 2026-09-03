export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

// Fase 47 (03/09/2026): @react-pdf/renderer (React.createElement(DashboardReport,
// body) + renderToBuffer) trocado por HTML + Puppeteer -- confirmado que
// @react-pdf/renderer quebra ("Minified React error #31") dentro deste
// servidor Next.js 15 independente de versão (4.5.1/4.9.0/3.4.5 testadas,
// todas falham; fora do processo Next, todas funcionam). Só a geração do
// buffer do PDF mudou -- hash/QR/assinatura/persistência abaixo continuam
// idênticos, operando sobre o buffer resultante como sempre.
import { buildDashboardReportHtml, type DashboardReportParams } from "@/reports/buildDashboardReportHtml"
import { renderReportPdfBuffer } from "@/reports/renderReportPdfBuffer"
import {
  getIdempotentResponse,
  storeIdempotentResponse
} from "@/lib/idempotency"

export const runtime = "nodejs"

type JsonRecord = Record<string, unknown>

type IdempotentStoredResponse = {
  response: {
    status: number
    body: unknown
  }
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as JsonRecord).sort())
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const raw = forwardedFor ?? realIp ?? "unknown"

  return raw.includes(",") ? raw.split(",")[0]?.trim() || "unknown" : raw
}

export async function POST(req: NextRequest) {
    const { prisma } = await import("@/lib/prisma")

  try {
    const body = (await req.json().catch(() => null)) as unknown

    if (!isJsonRecord(body)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    const now = new Date().toISOString()

    const payloadHash = crypto
      .createHash("sha256")
      .update(stableStringify(body))
      .digest("hex")

    const existing = (await getIdempotentResponse(
      payloadHash
    )) as IdempotentStoredResponse | null

    if (existing?.response) {
      return NextResponse.json(existing.response.body, {
        status: existing.response.status
      })
    }

    const html = buildDashboardReportHtml(body as unknown as DashboardReportParams)
    const pdfBuffer = await renderReportPdfBuffer(html)

    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex")
    const qrCode = await QRCode.toDataURL(pdfHash)

    // Assina o hash e persiste a certificacao real (PdfCertification/Prisma),
    // consumida depois por POST /api/reports/verify. Best-effort: falha de
    // assinatura/persistencia nao derruba a geracao do PDF em si -- o
    // chamador sabe pelo campo "certified" se a certificacao ficou
    // registrada de verdade, em vez de assumir silenciosamente.
    let certified = false
    try {
      const { signHash } = await import("@/services/pdf/pdfSigner")
      const { storePdfCertification } = await import("@/services/pdf/pdfCertification")

      const signature = signHash(pdfHash)

      await storePdfCertification({
        pdfHash,
        signature,
        algorithm: "RSA-SHA256",
        ipAddress: getClientIp(req),
        userAgent: req.headers.get("user-agent") || "unknown"
      })

      certified = true
    } catch (certError) {
      console.error("Erro ao assinar/persistir certificacao do PDF:", certError)
    }

    const responsePayload = {
      success: true,
      payloadHash,
      pdfHash,
      qrCode,
      certified,
      generatedAt: now
    }

    const db = prisma as unknown as {
      pericial_logs?: {
        findFirst?: (
          args: unknown
        ) => Promise<{ current_hash?: string | null } | null>
        create?: (args: unknown) => Promise<unknown>
      }
    }

    if (db.pericial_logs?.findFirst && db.pericial_logs.create) {
      const lastLog = await db.pericial_logs.findFirst({
        orderBy: { created_at: "desc" }
      })

      const previousHash = lastLog?.current_hash || "GENESIS"

      const currentHash = crypto
        .createHash("sha256")
        .update(payloadHash + pdfHash + previousHash + now)
        .digest("hex")

      await db.pericial_logs.create({
        data: {
          report_id: crypto.randomUUID(),
          idempotency_key: payloadHash,
          payload_hash: payloadHash,
          pdf_hash: pdfHash,
          previous_hash: previousHash,
          current_hash: currentHash,
          request_payload: body,
          response_payload: responsePayload,
          ip_address: getClientIp(req),
          user_agent: req.headers.get("user-agent") || "unknown",
          created_at: new Date(now)
        }
      })
    }

    await storeIdempotentResponse(payloadHash, 200, responsePayload)

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("REPORT_GENERATION_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao gerar relatório",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
