// Rota de teste TEMPORARIA -- mesma logica exata de
// app/api/reports/generate/route.ts (mesmas funcoes, cria uma
// certificacao real via storePdfCertification), so devolvendo os bytes
// do PDF em base64 tambem, pra permitir re-upload em /api/reports/verify
// e fechar o loop generate -> verify de ponta a ponta. Sera removida
// assim que o teste terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { buildDashboardReportHtml, type DashboardReportParams } from "@/reports/buildDashboardReportHtml"
import { renderReportPdfBuffer } from "@/reports/renderReportPdfBuffer"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DashboardReportParams

    const html = buildDashboardReportHtml(body)
    const pdfBuffer = await renderReportPdfBuffer(html)
    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex")

    let certified = false
    try {
      const { signHash } = await import("@/services/pdf/pdfSigner")
      const { storePdfCertification } = await import("@/services/pdf/pdfCertification")
      const signature = signHash(pdfHash)
      await storePdfCertification({
        pdfHash,
        signature,
        algorithm: "RSA-SHA256",
        ipAddress: "zztmp-verify-loop-test",
        userAgent: "zztmp-verify-loop-test",
      })
      certified = true
    } catch (certError) {
      console.error("ZZTMP_VERIFY_LOOP certification error:", certError)
    }

    return NextResponse.json({
      pdfHash,
      certified,
      pdfBase64: pdfBuffer.toString("base64"),
    })
  } catch (error) {
    console.error("ZZTMP_VERIFY_LOOP_ERROR", error)
    return NextResponse.json(
      { error: "Erro no teste", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
