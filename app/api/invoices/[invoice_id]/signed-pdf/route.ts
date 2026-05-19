import fs from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import SignPdf from "@signpdf/signpdf"
import { P12Signer } from "@signpdf/signer-p12"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type InvoiceRow = {
  id: string
  pdf_path?: string | null
}

type SupabaseClient = ReturnType<typeof createClient>

type PdfSigner = {
  sign: (
    pdfBuffer: Buffer,
    signer: InstanceType<typeof P12Signer>
  ) => Buffer | Uint8Array | ArrayBuffer | Promise<Buffer | Uint8Array | ArrayBuffer>
}

type SignPdfConstructor = {
  new (): PdfSigner
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getSupabaseClient(): SupabaseClient | null {
  const url = safeString(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = safeString(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey)
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
  context: { params: Promise<{ invoice_id: string }> }
) {
  void req

  try {
    const { invoice_id } = await context.params
    const invoiceId = safeString(invoice_id)

    if (!invoiceId) {
      return NextResponse.json(
        { error: "INVOICE_ID_REQUIRED" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_ENV_MISSING" },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from("financial_invoices")
      .select("id, pdf_path")
      .eq("id", invoiceId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "INVOICE_NOT_FOUND" }, { status: 404 })
    }

    const invoice = data as InvoiceRow
    const pdfPath = safeString(invoice.pdf_path)

    if (!pdfPath) {
      return NextResponse.json({ error: "PDF_PATH_MISSING" }, { status: 404 })
    }

    const resolvedPdfPath = path.resolve(pdfPath)

    if (!fs.existsSync(resolvedPdfPath)) {
      return NextResponse.json({ error: "PDF_BASE_NOT_FOUND" }, { status: 404 })
    }

    const pfxPath = safeString(process.env.A1_PFX_PATH)
    const pfxPassword = process.env.A1_PFX_PASSWORD ?? ""

    if (!pfxPath) {
      return NextResponse.json(
        { error: "CERTIFICATE_PATH_MISSING" },
        { status: 500 }
      )
    }

    const resolvedPfxPath = path.resolve(pfxPath)

    if (!fs.existsSync(resolvedPfxPath)) {
      return NextResponse.json(
        { error: "CERTIFICATE_NOT_FOUND" },
        { status: 500 }
      )
    }

    const unsignedPdf = fs.readFileSync(resolvedPdfPath)
    const p12Buffer = fs.readFileSync(resolvedPfxPath)

    const signer = new P12Signer(p12Buffer, {
      passphrase: pfxPassword
    })

    const SignPdfClass = SignPdf as unknown as SignPdfConstructor
    const signedPdf = await new SignPdfClass().sign(unsignedPdf, signer)

    return new NextResponse(toArrayBuffer(signedPdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("SIGNED_PDF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}