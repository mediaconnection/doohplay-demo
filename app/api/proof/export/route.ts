export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import path from "path"
import * as fs from "fs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import PDFDocument from "pdfkit"
import QRCode from "qrcode"

export const runtime = "nodejs"

type DisplayEventRow = {
  campaign_id?: string | null
  player_id?: string | null
  location_id?: string | null
  played_at?: string | null
}

type ProofChainRow = {
  chain_hash?: string | null
  merkle_batch_id?: string | number | null
}

type MerkleBatchRow = {
  root_hash?: string | null
  tsa_time?: string | null
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeHash(value: unknown): string | null {
  const raw = safeString(value)
  if (!raw) return null

  const normalized = raw.toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function getSupabaseClient() {
  const url = safeString(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = safeString(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey)
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  )
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function createPdfBuffer(
  hash: string,
  event: DisplayEventRow,
  chain: ProofChainRow | null,
  batch: MerkleBatchRow | null,
  verifyUrl: string,
  qrDataUrl: string
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const fontPath = path.join(
      process.cwd(),
      "src/assets/fonts/Roboto-Regular.ttf"
    )

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    })

    const chunks: Buffer[] = []

    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    if (fs.existsSync(fontPath)) {
      doc.font(fontPath)
    }

    doc.fontSize(24).text("DOOHPLAY", {
      align: "center"
    })

    doc.fontSize(14).text("Proof of Display Certificate", {
      align: "center"
    })

    doc.moveDown(2)

    doc.fontSize(12).text(`Campaign: ${event.campaign_id ?? "N/A"}`)
    doc.text(`Player: ${event.player_id ?? "N/A"}`)
    doc.text(`Location: ${event.location_id ?? "N/A"}`)
    doc.text(`Timestamp: ${event.played_at ?? "N/A"}`)

    doc.moveDown()

    doc.fontSize(14).text("Cryptographic Proof")
    doc.moveDown()

    doc.fontSize(10).text("Event Hash:")
    doc.text(hash, { width: 500 })

    doc.moveDown()

    doc.text("Chain Hash:")
    doc.text(chain?.chain_hash ?? "not available", {
      width: 500
    })

    doc.moveDown()

    doc.text("Merkle Root:")
    doc.text(batch?.root_hash ?? "not available", {
      width: 500
    })

    doc.moveDown()

    doc.text("TSA Timestamp:")
    doc.text(batch?.tsa_time ?? "not available")

    doc.moveDown(2)

    doc.text("Verify Online:")
    doc.text(verifyUrl)

    doc.moveDown()

    const qrImage = qrDataUrl.replace(/^data:image\/png;base64,/, "")

    doc.image(Buffer.from(qrImage, "base64"), {
      width: 180,
      align: "center"
    })

    doc.end()
  })
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const hash = normalizeHash(url.searchParams.get("hash"))

    if (!hash) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_ENV_MISSING" },
        { status: 500 }
      )
    }

    const { data: eventData, error: eventError } = await supabase
      .from("display_events")
      .select("campaign_id, player_id, location_id, played_at")
      .eq("event_hash", hash)
      .maybeSingle()

    if (eventError) {
      throw new Error(eventError.message)
    }

    if (!eventData) {
      return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404 })
    }

    const event = eventData as DisplayEventRow

    const { data: chainData, error: chainError } = await supabase
      .from("proof_chain")
      .select("chain_hash, merkle_batch_id")
      .eq("event_hash", hash)
      .maybeSingle()

    if (chainError) {
      throw new Error(chainError.message)
    }

    const chain = chainData as ProofChainRow | null
    let batch: MerkleBatchRow | null = null

    if (chain?.merkle_batch_id) {
      const { data: batchData, error: batchError } = await supabase
        .from("proof_merkle_batches")
        .select("root_hash, tsa_time")
        .eq("id", chain.merkle_batch_id)
        .maybeSingle()

      if (batchError) {
        throw new Error(batchError.message)
      }

      batch = batchData as MerkleBatchRow | null
    }

    const verifyUrl = `${getBaseUrl()}/verify/${encodeURIComponent(hash)}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl)

    const buffer = await createPdfBuffer(
      hash,
      event,
      chain,
      batch,
      verifyUrl,
      qrDataUrl
    )

    return new Response(toArrayBuffer(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proof-${hash}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("PROOF_EXPORT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PROOF_EXPORT_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
