export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import crypto from "crypto"
import React from "react"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import QRCode from "qrcode"

import DashboardReport from "@/reports/DashboardReport"
import { prisma } from "@/lib/prisma"
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

    const ReportComponent = DashboardReport as React.ComponentType<JsonRecord>
    const reportElement = React.createElement(ReportComponent, body)

    const pdfBuffer = await renderToBuffer(reportElement)

    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex")
    const qrCode = await QRCode.toDataURL(pdfHash)

    const responsePayload = {
      success: true,
      payloadHash,
      pdfHash,
      qrCode,
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
