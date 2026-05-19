import { NextRequest, NextResponse } from "next/server"

import { generateInvoicePdf } from "@/lib/generateInvoicePdf"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type InvoiceRow = {
  id: string
  total_amount: number | string | null
  currency: string | null
  snapshot_hash: string | null
  issued_at: string | null
  financial_closures:
    | {
        reference_month?: string | null
      }
    | {
        reference_month?: string | null
      }[]
    | null
  tenants:
    | {
        name?: string | null
      }
    | {
        name?: string | null
      }[]
    | null
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getNestedString(
  value: unknown,
  key: string,
  fallback = "—"
): string {
  const target = Array.isArray(value) ? value[0] : value

  if (!target || typeof target !== "object") return fallback

  const raw = (target as Record<string, unknown>)[key]
  return safeString(raw) ?? fallback
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
        { error: "INVALID_INVOICE_ID" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("financial_invoices")
      .select(
        `
        id,
        total_amount,
        currency,
        snapshot_hash,
        issued_at,
        financial_closures (
          reference_month
        ),
        tenants (
          name
        )
      `
      )
      .eq("id", invoiceId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    const invoice = data as InvoiceRow

    const pdf = await generateInvoicePdf({
      id: invoice.id,
      tenant_name: getNestedString(invoice.tenants, "name"),
      reference_month: getNestedString(
        invoice.financial_closures,
        "reference_month"
      ),
      total_amount: invoice.total_amount,
      currency: invoice.currency,
      snapshot_hash: invoice.snapshot_hash,
      issued_at: invoice.issued_at
    })

    return new NextResponse(toArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fatura-${invoice.id}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("INVOICE_PDF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INVOICE_PDF_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}