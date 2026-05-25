// @ts-nocheck
import PDFDocument from "pdfkit"

import { generateCampaignAudit } from "@/lib/audit/generateCampaignAudit"

type CampaignAuditSignature =
  | string
  | {
      signedHash?: string | null
      certificateSerial?: string | null
      certificateAuthority?: string | null
      [key: string]: unknown
    }

type CampaignAuditPlay = {
  merkle_root?: string | null
  [key: string]: unknown
}

type CampaignAuditReport = {
  total_plays?: number
  ledger_anchor?: unknown
  signature?: CampaignAuditSignature
  plays?: CampaignAuditPlay[]
}

function stringifyPdfValue(value: unknown): string {
  if (value === null || value === undefined) return "N/A"

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : "N/A"
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatSignature(signature: CampaignAuditSignature | undefined): string {
  if (!signature) return "N/A"

  if (typeof signature === "string") {
    return signature.trim() || "N/A"
  }

  return [
    `Signed Hash: ${stringifyPdfValue(signature.signedHash)}`,
    `Certificate Serial: ${stringifyPdfValue(signature.certificateSerial)}`,
    `Certificate Authority: ${stringifyPdfValue(signature.certificateAuthority)}`
  ].join("\n")
}

export async function generateCampaignCertificate(
  campaignId: string,
  start: string,
  end: string
): Promise<Buffer> {
  const report = (await generateCampaignAudit(
    campaignId,
    start,
    end
  )) as CampaignAuditReport

  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  })

  const buffers: Buffer[] = []

  doc.on("data", (chunk: Buffer) => {
    buffers.push(chunk)
  })

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers))
    })

    doc.on("error", reject)

    doc.fontSize(20).text("DOOHPLAY Campaign Proof Certificate", {
      align: "center"
    })

    doc.moveDown()

    doc.fontSize(14).text(`Campaign ID: ${campaignId}`)
    doc.text(`Period: ${start} -> ${end}`)
    doc.text(`Total Plays: ${report.total_plays ?? 0}`)

    doc.moveDown()

    doc.fontSize(14).text("Ledger Anchor:")
    doc.fontSize(10).text(stringifyPdfValue(report.ledger_anchor), {
      width: 480
    })

    doc.moveDown()

    doc.fontSize(14).text("Digital Signature:")
    doc.fontSize(10).text(formatSignature(report.signature), {
      width: 480
    })

    doc.moveDown()

    doc.fontSize(14).text("Merkle Root Samples:")

    const plays = Array.isArray(report.plays) ? report.plays : []

    const merkleRoots = plays
      .slice(0, 5)
      .map((play: CampaignAuditPlay) => play.merkle_root)
      .filter((root): root is string => {
        return typeof root === "string" && root.trim().length > 0
      })

    if (merkleRoots.length === 0) {
      doc.fontSize(10).text("N/A")
    } else {
      merkleRoots.forEach((root: string) => {
        doc.fontSize(10).text(root, { width: 480 })
      })
    }

    doc.end()
  })
}
