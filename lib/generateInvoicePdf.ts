// @ts-nocheck
import React from "react"
import {
  Document,
  renderToBuffer,
  type DocumentProps
} from "@react-pdf/renderer"
import QRCode from "qrcode"

import FinancialInvoiceReport from "@/reports/FinancialInvoiceReport"

type InvoiceInput = Record<string, unknown> & {
  id?: string | number | null
}

type InvoiceReportData = {
  id: string
  tenant_name: string
  reference_month: string
  total_amount: number
  currency: string
  snapshot_hash: string
  issued_at: string
  qr_code_url: string
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function generateInvoicePdf(
  invoice: InvoiceInput
): Promise<Buffer> {
  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"

  const invoiceId = String(invoice.id ?? "")
  const verifyUrl = `${baseUrl}/verificar?invoice_id=${invoiceId}`
  const qrCodeUrl = await QRCode.toDataURL(verifyUrl)

  const normalizedInvoice: InvoiceReportData = {
    id: invoiceId,
    tenant_name: safeString(invoice.tenant_name, "—"),
    reference_month: safeString(invoice.reference_month, "—"),
    total_amount: safeNumber(invoice.total_amount),
    currency: safeString(invoice.currency, "BRL"),
    snapshot_hash: safeString(invoice.snapshot_hash, "—"),
    issued_at: safeString(invoice.issued_at, new Date().toISOString()),
    qr_code_url: qrCodeUrl
  }

  const reportElement = React.createElement(FinancialInvoiceReport, {
    invoice: normalizedInvoice
  })

  const documentElement = React.createElement(
    Document as React.ComponentType<DocumentProps>,
    null,
    reportElement
  )

  return renderToBuffer(documentElement)
}

export default generateInvoicePdf
