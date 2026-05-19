import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import QRCode from "qrcode"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AuditPdfRow = {
  event_id: string | number
  event_hash: string | null
  payload: Record<string, unknown> | null
  occurred_at: string | Date | null
  block_height: number | string | null
  merkle_root: string | null
  signature: string | null
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject)

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }

  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value))
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex")
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ event_id: string }> }
) {
  void req

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    const { event_id } = await context.params
    const eventId = safeString(event_id)

    if (!eventId) {
      return NextResponse.json({ error: "INVALID_EVENT_ID" }, { status: 400 })
    }

    const eventRes = await pool.query(
      `
      select
        e.event_id,
        e.event_hash,
        e.payload,
        e.occurred_at,
        e.block_height,
        b.merkle_root,
        b.signature
      from public.event_chain e
      left join public.event_blocks b on e.block_id = b.id
      where e.event_id::text = $1
      limit 1
      `,
      [eventId]
    )

    const rows = eventRes.rows as AuditPdfRow[]
    const event = rows[0]

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const recomputed = sha256(stableStringify(event.payload ?? {}))
    const storedHash = String(event.event_hash ?? "").replace(/^0x/, "")
    const valid = recomputed === storedHash

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      "http://localhost:3000"

    const verifyUrl = `${baseUrl}/verify/${encodeURIComponent(eventId)}`
    const qr = await QRCode.toDataURL(verifyUrl)

    const payloadJson = escapeHtml(JSON.stringify(event.payload ?? {}, null, 2))

    const html = `
      <html>
        <body style="font-family: Arial; padding: 40px; color:#111;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h1 style="margin:0;">DOOHPLAY Audit Report</h1>
              <p style="color:gray;">Cryptographic Proof of Execution</p>
            </div>

            ${
              valid
                ? `<div style="background:#000;color:#fff;padding:8px 12px;border-radius:6px;">✔ VERIFIED</div>`
                : `<div style="background:#991b1b;color:#fff;padding:8px 12px;border-radius:6px;">INVALID</div>`
            }
          </div>

          <hr style="margin:20px 0;"/>

          <h2>Event Info</h2>
          <p><b>ID:</b> ${escapeHtml(event.event_id)}</p>
          <p><b>Timestamp:</b> ${escapeHtml(event.occurred_at)}</p>
          <p><b>Block Height:</b> ${escapeHtml(event.block_height)}</p>

          <h2>Integrity Check</h2>
          <p>
            <b>Status:</b>
            <span style="color:${valid ? "green" : "red"};">
              ${valid ? "VALID" : "INVALID"}
            </span>
          </p>

          <p><b>Stored Hash:</b><br/>${escapeHtml(event.event_hash)}</p>
          <p><b>Recomputed Hash:</b><br/>${escapeHtml(recomputed)}</p>

          <h2>Merkle Root</h2>
          <p>${escapeHtml(event.merkle_root || "-")}</p>

          <h2>Signature</h2>
          <p>${escapeHtml(event.signature || "-")}</p>

          <h2>Payload</h2>
          <pre style="background:#111;color:#0f0;padding:10px;border-radius:6px;font-size:11px;white-space:pre-wrap;">${payloadJson}</pre>

          <hr style="margin:30px 0;"/>

          <div style="display:flex; align-items:center; gap:20px;">
            <div>
              <p style="font-size:12px;color:gray;">Scan to verify:</p>
              <img src="${qr}" width="120" />
            </div>

            <div style="font-size:12px;">
              <p><b>Verification URL:</b></p>
              <p>${escapeHtml(verifyUrl)}</p>
            </div>
          </div>
        </body>
      </html>
    `

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "load" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    })

    return new NextResponse(toArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="doohplay-${eventId}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("AUDIT_PDF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined)
    }
  }
}