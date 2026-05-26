export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const runtime = "nodejs"

/* =========================
   HELPERS
========================= */

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  return v.length > 0 ? v : null
}

function normalizeHash(hash: string) {
  return hash.toLowerCase().replace(/^0x/, "")
}

function isHash(value: string) {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

/* =========================
   GET /api/audit/search
   ?q=hash|event_id|source_id
========================= */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const query = safeString(searchParams.get("q"))

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter ?q=" },
        { status: 400 }
      )
    }

    const normalized = normalizeHash(query)

    let sql = ""
    let params: any[] = []

    /* =========================
       SEARCH STRATEGY
    ========================= */

    if (isHash(query)) {
      // 🔍 busca por hash
      sql = `
        SELECT *
        FROM public.event_chain
        WHERE lower(replace(event_hash, '0x', '')) = $1
           OR lower(replace(previous_event_hash, '0x', '')) = $1
        ORDER BY created_at DESC
        LIMIT 50
      `
      params = [normalized]
    } else {
      // 🔍 busca textual
      sql = `
        SELECT *
        FROM public.event_chain
        WHERE event_id::text = $1
           OR source_id::text = $1
           OR device_id = $1
           OR campaign_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `
      params = [query]
    }

    const { rows } = await pool.query(sql, params)

    return NextResponse.json({
      success: true,
      query,
      count: rows.length,
      results: rows
    })
  } catch (error) {
    console.error("AUDIT_SEARCH_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search events",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/* =========================
   POST (opcional)
   body: { q: string }
========================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const query = safeString(body?.q)

    if (!query) {
      return NextResponse.json(
        { error: "Missing body.q" },
        { status: 400 }
      )
    }

    const url = new URL(req.url)
    url.searchParams.set("q", query)

    return GET(new NextRequest(url.toString()))
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}
