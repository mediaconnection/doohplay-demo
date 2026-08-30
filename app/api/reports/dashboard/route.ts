export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export const runtime = "nodejs"

import crypto from "crypto"
import React from "react"
import { renderToStream } from "@react-pdf/renderer"
import QRCode from "qrcode"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

import DashboardReport from "../../../../reports/DashboardReport"
import { streamToBuffer } from "../../../../lib/pdfToBuffer"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const start = "2026-01-01"
    const end = "2026-01-31"

    const kpis = {
      total_executions: 2,
      active_players: 2,
      total_seconds: 60,
      active_campaigns: 1,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsignedStream = (await (renderToStream as any)(
      React.createElement(DashboardReport, { start, end, kpis })
    )) as NodeJS.ReadableStream

    const unsignedBuffer = await streamToBuffer(unsignedStream as never)

    const integrityHash = crypto
      .createHash("sha256")
      .update(unsignedBuffer)
      .digest("hex")

    const signedAt = new Date().toISOString()

    const privateKey = process.env.PDF_SIGN_PRIVATE_KEY
    if (!privateKey) {
      return Response.json({ error: "PDF_SIGN_PRIVATE_KEY não configurada" }, { status: 500 })
    }

    const signature = crypto
      .sign("sha256", Buffer.from(integrityHash, "utf8"), {
        key: privateKey,
        dsaEncoding: "ieee-p1363",
      })
      .toString("base64")

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000"

    const verifyUrl = `${appUrl}/verify/${integrityHash}`

    let qrCode: string | undefined
    try {
      qrCode = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: "H",
        width: 200,
        margin: 1,
      })
    } catch (err) {
      console.warn("Falha ao gerar QR Code:", err)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signedStream = (await (renderToStream as any)(
      React.createElement(DashboardReport, {
        start, end, kpis, integrityHash, signedAt, signature, qrCode,
      } as never)
    )) as NodeJS.ReadableStream

    const signedBuffer = await streamToBuffer(signedStream as never)

    return new Response(new Uint8Array(signedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="dashboard-signed.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (err) {
    console.error("Erro ao gerar PDF:", err)
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

