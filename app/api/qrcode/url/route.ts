/**
 * app/api/qrcode/url/route.ts
 *
 * Gera um QR code (SVG) pra qualquer URL, via query param. Diferente de
 * /api/qrcode/[code], que é fixo pra /lead/[code] — essa é genérica,
 * usada pela enquete e por qualquer outro widget que precise de QR no futuro.
 *
 * Uso: GET /api/qrcode/url?u=https://doohplay.com.br/enquete/xxxx
 */
import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u")
  if (!url) return NextResponse.json({ error: "parâmetro 'u' (URL) é obrigatório" }, { status: 400 })

  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      color: { dark: "#0B1120", light: "#FFFFFF" },
    })
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err) {
    console.error("[qrcode/url GET]", err)
    return NextResponse.json({ error: "Erro ao gerar QR code" }, { status: 500 })
  }
}
