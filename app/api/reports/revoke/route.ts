export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash")

  if (!hash) {
    return Response.json({ error: "Missing hash" }, { status: 400 })
  }

  const { error } = await supabase
    .from("pdf_hashes")
    .update({
      status: "revoked",
      status_changed_at: new Date().toISOString(),
    })
    .eq("hash", hash)

  if (error) {
    return Response.json({ error: "Failed to revoke" }, { status: 500 })
  }

  return NextResponse.redirect(new URL("/admin/reports", request.url))
}
