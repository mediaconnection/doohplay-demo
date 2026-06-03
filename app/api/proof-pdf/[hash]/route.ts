import { NextRequest, NextResponse } from "next/server"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QRCode = require("qrcode")

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash: rawHash } = await params
  const hash = rawHash.trim().toLowerCase().replace(/^0x/, "")

  if (!/^[a-f0-9]{64}$/i.test(hash)) {
    return NextResponse.json({ error: "Hash inválido" }, { status: 400 })
  }

  // Buscar dados da verificação
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://doohplay-demo.onrender.com"
  let verifyData: Record<string, unknown> = {}
  try {
    const res = await fetch(`${baseUrl}/api/verify/${hash}`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    })
    if (res.ok) {
      verifyData = await res.json() as Record<string, unknown>
    }
  } catch {
    // continua mesmo sem dados da API
  }

  const status = (verifyData.status as string) ?? "UNKNOWN"
  const score = typeof verifyData.score === "number" ? verifyData.score : null
  const trustLevel = (verifyData.trust_level as string) ?? (verifyData.trust as string) ?? "—"
  const riskLevel = (verifyData.risk_level as string) ?? (verifyData.risk as string) ?? "—"
  const hash0x = (verifyData.hash_0x as string) ?? `0x${hash}`
  const verifyUrl = `${baseUrl}/verify/${hash}`
  const txHash = (verifyData as { anchor?: { tx_hash?: string } }).anchor?.tx_hash
    ?? ((verifyData as { blockchain?: { tx_hash?: string } }).blockchain?.tx_hash)
    ?? null
  const polygonUrl = txHash ? `https://polygonscan.com/tx/${txHash}` : null
  const summary = (verifyData.explanation as { summary?: string } | undefined)?.summary
    ?? (verifyData.summary as string | undefined)
    ?? "Prova validada pelo sistema DOOHPLAY."

  const generatedAt = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "long",
    timeStyle: "medium"
  })

  // Gerar QR code como buffer PNG
  const qrBuffer: Buffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 120,
    margin: 1,
    errorCorrectionLevel: "M"
  })

  // Gerar PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" })
  const chunks: Buffer[] = []

  doc.on("data", (chunk: Buffer) => chunks.push(chunk))

  await new Promise<void>((resolve) => {
    doc.on("end", resolve)

    // ── Cabeçalho ──
    doc
      .fillColor("#0f172a")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("DOOHPLAY", 50, 50)

    doc
      .fillColor("#64748b")
      .fontSize(10)
      .font("Helvetica")
      .text("Prova de Verificação Criptográfica", 50, 78)

    // Linha separadora
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor("#e2e8f0").lineWidth(1).stroke()

    // ── Status Badge ──
    const badgeColor = status === "VERIFIED" ? "#059669"
      : status === "WARNING" ? "#d97706"
      : status === "PENDING" ? "#0284c7"
      : "#dc2626"

    doc.roundedRect(50, 115, 110, 28, 6).fillColor(badgeColor).fill()
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold")
      .text(status, 50, 122, { width: 110, align: "center" })

    if (score !== null) {
      doc.roundedRect(170, 115, 80, 28, 6).fillColor("#f1f5f9").fill()
      doc.fillColor("#0f172a").fontSize(11).font("Helvetica-Bold")
        .text(`${score}/100`, 170, 122, { width: 80, align: "center" })
    }

    doc.roundedRect(260, 115, 100, 28, 6).fillColor("#f1f5f9").fill()
    doc.fillColor("#0f172a").fontSize(10).font("Helvetica")
      .text(`Trust: ${trustLevel}`, 260, 123, { width: 100, align: "center" })

    doc.roundedRect(370, 115, 100, 28, 6).fillColor("#f1f5f9").fill()
    doc.fillColor("#0f172a").fontSize(10).font("Helvetica")
      .text(`Risk: ${riskLevel}`, 370, 123, { width: 100, align: "center" })

    // ── Hash ──
    doc.moveDown(3)
    doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
      .text("HASH VERIFICADO", 50, 160)
    doc.roundedRect(50, 172, 495, 32, 4).fillColor("#0f172a").fill()
    doc.fillColor("#f8fafc").fontSize(8).font("Courier")
      .text(hash0x, 58, 181, { width: 479 })

    // ── Resumo ──
    doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
      .text("RESUMO DA VERIFICAÇÃO", 50, 218)
    doc.fillColor("#334155").fontSize(10).font("Helvetica")
      .text(summary, 50, 232, { width: 495, lineGap: 2 })

    // ── Camadas de verificação ──
    const layers = Array.isArray(verifyData.layers) ? verifyData.layers as Array<{
      name?: string; valid?: boolean; weight?: number; message?: string
    }> : []

    let yPos = 290
    if (layers.length > 0) {
      doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
        .text("CAMADAS DE VERIFICAÇÃO", 50, yPos)
      yPos += 16

      for (const layer of layers) {
        const valid = layer.valid === true
        const icon = valid ? "✓" : "✗"
        const color = valid ? "#059669" : "#dc2626"
        const name = (layer.name ?? "").toUpperCase()
        const weight = typeof layer.weight === "number" ? `${layer.weight}pts` : ""
        const msg = layer.message ?? ""

        doc.fillColor(color).fontSize(10).font("Helvetica-Bold")
          .text(icon, 50, yPos)
        doc.fillColor("#0f172a").fontSize(10).font("Helvetica-Bold")
          .text(name, 68, yPos)
        doc.fillColor("#64748b").fontSize(9).font("Helvetica")
          .text(weight, 180, yPos + 1)
        if (msg) {
          doc.fillColor("#475569").fontSize(8.5).font("Helvetica")
            .text(msg, 68, yPos + 14, { width: 427 })
          yPos += 32
        } else {
          yPos += 20
        }
      }
    }

    // ── Blockchain TX ──
    yPos += 10
    if (txHash) {
      doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
        .text("TRANSAÇÃO BLOCKCHAIN (POLYGON)", 50, yPos)
      yPos += 14
      doc.fillColor("#1d4ed8").fontSize(8.5).font("Courier")
        .text(String(txHash), 50, yPos, { width: 495 })
      yPos += 20
      if (polygonUrl) {
        doc.fillColor("#475569").fontSize(8.5).font("Helvetica")
          .text("PolygonScan: ", 50, yPos, { continued: true })
        doc.fillColor("#1d4ed8").text(polygonUrl, { link: polygonUrl })
        yPos += 18
      }
    }

    // ── QR Code + URL ──
    yPos += 10
    doc.image(qrBuffer, 50, yPos, { width: 90, height: 90 })
    doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
      .text("URL DE VERIFICAÇÃO PÚBLICA", 152, yPos)
    doc.fillColor("#1d4ed8").fontSize(9).font("Helvetica")
      .text(verifyUrl, 152, yPos + 14, { link: verifyUrl, width: 393 })
    doc.fillColor("#64748b").fontSize(8.5).font("Helvetica")
      .text("Escaneie o QR Code ou acesse a URL para verificar esta prova.", 152, yPos + 30, { width: 393 })

    // ── Rodapé ──
    const footerY = 760
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e2e8f0").lineWidth(0.5).stroke()
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica")
      .text(`Gerado em ${generatedAt}  ·  DOOHPLAY Trust Infrastructure  ·  Este documento é uma prova criptográfica auditável.`,
        50, footerY + 8, { width: 495, align: "center" })

    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="prova-doohplay-${hash.slice(0, 12)}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
      "Cache-Control": "no-store"
    }
  })
}
