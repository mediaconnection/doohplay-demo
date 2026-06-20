/**
 * app/api/qrcode/[code]/route.ts
 *
 * Gera um QR code (SVG) apontando para a página pública de captura de
 * lead do cliente (/lead/[code]). Usado no rodapé do player na TV.
 *
 * Uso: GET /api/qrcode/BARBE332
 */

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://doohplay.com.br";
  const targetUrl = `${baseUrl}/lead/${code.toUpperCase()}`;

  try {
    const svg = await QRCode.toString(targetUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#0B1120",
        light: "#FFFFFF",
      },
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // QR não muda, pode cachear por 1h
      },
    });
  } catch (err) {
    console.error("[qrcode GET] Erro:", err);
    return NextResponse.json({ error: "Erro ao gerar QR code" }, { status: 500 });
  }
}
