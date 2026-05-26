import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash")

  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { error } = await supabase
    .from("pdf_hashes")
    .update({
      status: "revoked",
      status_changed_at: new Date().toISOString(),
    })
    .eq("hash", hash)

  if (error) {
    return NextResponse.json({ error: "Failed to revoke" }, { status: 500 })
  }

  return NextResponse.redirect(new URL("/admin/reports", request.url))
}