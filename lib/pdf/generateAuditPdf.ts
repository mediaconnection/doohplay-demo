import { PDFDocument, StandardFonts } from "pdf-lib"
import crypto from "crypto"
import QRCode from "qrcode"

type AuditInput = {
  campaign_id: string
  period: { start: string; end: string }

  total_plays: number
  verified_plays?: number
  verification_rate?: number

  ledger_anchor?: {
    merkle_root: string
    anchored_at: string
  }

  proof?: {
    block_hash: string
    merkle_root: string
  }

  signature?: string
  document_hash?: string
}

// 🔐 stringify determinístico
function stableStringify(obj: any): string {
  return JSON.stringify(sortObject(obj))
}

function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject)

  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObject(obj[key])
        return acc
      }, {})
  }

  return obj
}

export async function generateAuditPdf(data: AuditInput) {
  const pdf = await PDFDocument.create()
  let page = pdf.addPage([600, 800]) // 🔥 FIX
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  let y = 750

  function ensureSpace(lines = 1) {
    if (y < 50 + lines * 14) {
      page = pdf.addPage([600, 800]) // 🔥 FIX REAL
      y = 750
    }
  }

  function draw(text: string, size = 12) {
    ensureSpace()
    page.drawText(text, { x: 50, y, size, font })
    y -= size + 6
  }

  function drawMultiline(text: string, maxLength = 90) {
    const chunks = text.match(new RegExp(`.{1,${maxLength}}`, "g")) || []
    chunks.forEach(line => draw(line, 10))
  }

  // 🏷️ HEADER
  draw("DOOHPLAY AUDIT CERTIFICATE", 18)
  draw("========================================")

  // 📊 CAMPAIGN
  draw("Campaign Information", 14)
  draw(`Campaign ID: ${data.campaign_id}`)
  draw(`Period: ${data.period.start} → ${data.period.end}`)
  draw(`Total Plays: ${data.total_plays}`)

  if (data.verified_plays !== undefined) {
    draw(`Verified Plays: ${data.verified_plays}`)
  }

  if (data.verification_rate !== undefined) {
    draw(
      `Verification Rate: ${(data.verification_rate * 100).toFixed(2)}%`
    )
  }

  y -= 10

  // 🔐 STATUS
  let status = "UNKNOWN"

  if (data.verification_rate !== undefined) {
    if (data.verification_rate >= 0.95) status = "FULLY VERIFIED"
    else if (data.verification_rate >= 0.8) status = "PARTIAL"
    else status = "LOW TRUST"
  }

  draw("Verification Status", 14)
  draw(`Status: ${status}`)

  y -= 10

  // 🔗 ANCHOR
  if (data.ledger_anchor) {
    draw("Ledger Anchor", 14)
    draw(`Merkle Root: ${data.ledger_anchor.merkle_root}`)
    draw(`Anchored At: ${data.ledger_anchor.anchored_at}`)
    y -= 10
  }

  // 🌳 PROOF
  if (data.proof) {
    draw("Cryptographic Proof", 14)
    draw(`Block Hash: ${data.proof.block_hash}`)
    draw(`Merkle Root: ${data.proof.merkle_root}`)
    y -= 10
  }

  // 🔏 SIGNATURE
  draw("Digital Signature", 14)

  if (data.signature) {
    drawMultiline(data.signature)
  } else {
    draw("No signature available")
  }

  y -= 20

  // 🕒 TIMESTAMP
  const generatedAt = new Date().toISOString()
  draw(`Generated at: ${generatedAt}`)

  // 🔐 HASH determinístico
  const rawData = stableStringify({
    ...data,
    generated_at: generatedAt
  })

  const documentHash =
    data.document_hash ||
    crypto.createHash("sha256").update(rawData).digest("hex")

  y -= 20
  draw("Document Integrity", 14)
  drawMultiline(documentHash)

  // 📱 QR CODE (🔥 DIFERENCIAL)
  const qrPayload = {
    campaign_id: data.campaign_id,
    verification_rate: data.verification_rate,
    proof: data.proof,
    signature: data.signature,
    document_hash: documentHash
  }

  const qrDataUrl = await QRCode.toDataURL(
    JSON.stringify(qrPayload)
  )

  const qrBytes = Buffer.from(
    qrDataUrl.split(",")[1],
    "base64"
  )

  const qrImage = await pdf.embedPng(qrBytes)

  page.drawImage(qrImage, {
    x: 400,
    y: 100,
    width: 150,
    height: 150
  })

  return await pdf.save()
}