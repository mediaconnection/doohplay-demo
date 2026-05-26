export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

import { generateCertifiedReportPdf } from "@/services/pdf/generateCertifiedReportPdf"

export const runtime = "nodejs"

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

export async function GET() {
  try {
    const pdf = await generateCertifiedReportPdf()

    return new Response(toArrayBuffer(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="report-certified.pdf"',
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("REPORT_TEST_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "REPORT_TEST_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
