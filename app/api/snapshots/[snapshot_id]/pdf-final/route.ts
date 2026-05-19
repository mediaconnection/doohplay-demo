import { NextRequest, NextResponse } from "next/server"
import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"

import FinancialSnapshotReport from "@/reports/FinancialSnapshotReport"
import { signPdfWithA1 } from "@/lib/signPdfWithA1"
import { timestampWithTSA } from "@/lib/timestampWithTSA"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SnapshotPdfDataLoose = Record<string, unknown>

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function normalizeSnapshotPdfData(value: unknown): SnapshotPdfDataLoose {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      snapshot: {},
      integrity: {},
      legal: {}
    }
  }

  const record = value as Record<string, unknown>

  return {
    ...record,
    snapshot: record.snapshot ?? {},
    integrity: record.integrity ?? {},
    legal: record.legal ?? {}
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ snapshot_id: string }> }
) {
  try {
    const { snapshot_id } = await context.params
    const snapshotId = safeString(snapshot_id)

    if (!snapshotId) {
      return NextResponse.json(
        { error: "SNAPSHOT_ID_REQUIRED" },
        { status: 400 }
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      new URL(req.url).origin

    const dataRes = await fetch(
      `${baseUrl}/api/snapshots/${encodeURIComponent(snapshotId)}/pdf-data`,
      { cache: "no-store" }
    )

    if (!dataRes.ok) {
      throw new Error(`PDF_DATA_FETCH_FAILED_${dataRes.status}`)
    }

    const pdfData = normalizeSnapshotPdfData(await dataRes.json())

    const ReportComponent = FinancialSnapshotReport as unknown as React.ComponentType<{
      data: SnapshotPdfDataLoose
    }>

    const pdfElement = React.createElement(ReportComponent, {
      data: pdfData
    })

    const pdf = await renderToBuffer(
      pdfElement as Parameters<typeof renderToBuffer>[0]
    )

    const signedPdf = await signPdfWithA1(pdf)

    await timestampWithTSA(signedPdf)

    return new NextResponse(toArrayBuffer(signedPdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="snapshot-final-${snapshotId}.pdf"`,
        "X-Timestamped": "true",
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("PDF_FINAL_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PDF_FINAL_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}