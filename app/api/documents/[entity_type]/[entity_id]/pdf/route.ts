import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidEntityType(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(value)
}

function isValidEntityId(value: string): boolean {
  return /^[a-zA-Z0-9_.:-]{1,120}$/.test(value)
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      entity_type: string
      entity_id: string
    }>
  }
) {
  try {
    const { entity_type, entity_id } = await context.params

    const entityType = safeString(entity_type)
    const entityId = safeString(entity_id)
    const hash = normalizeHash(req.nextUrl.searchParams.get("hash"))

    if (!entityType || !isValidEntityType(entityType)) {
      return NextResponse.json(
        { error: "INVALID_ENTITY_TYPE" },
        { status: 400 }
      )
    }

    if (!entityId || !isValidEntityId(entityId)) {
      return NextResponse.json(
        { error: "INVALID_ENTITY_ID" },
        { status: 400 }
      )
    }

    if (!hash) {
      return NextResponse.json({ error: "HASH_REQUIRED" }, { status: 400 })
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: "SUPABASE_PUBLIC_ENV_MISSING" },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from("digital_certifications")
      .select("proof_url, is_public")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("content_hash", hash)
      .eq("is_public", true)
      .limit(1)

    if (error) {
      console.error("SUPABASE_CERTIFICATION_LOOKUP_ERROR", error)

      return NextResponse.json(
        { error: "CERTIFICATION_LOOKUP_FAILED" },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "DOCUMENT_NOT_AUTHORIZED" },
        { status: 403 }
      )
    }

    const pdfUrl = safeString(data[0]?.proof_url)

    if (!pdfUrl) {
      return NextResponse.json(
        { error: "PDF_NOT_AVAILABLE" },
        { status: 404 }
      )
    }

    const pdfResponse = await fetch(pdfUrl, { cache: "no-store" })

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "PDF_FETCH_ERROR" },
        { status: 502 }
      )
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="documento-verificado-${hash.slice(
          0,
          12
        )}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("DOCUMENT_PDF_VERIFY_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}