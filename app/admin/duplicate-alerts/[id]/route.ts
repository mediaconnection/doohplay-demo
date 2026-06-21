// app/api/admin/duplicate-alerts/[id]/route.ts
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, context: any) {
  const session = await getServerSession()
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")

  const isNextAuth = !!session?.user
  const isLegacy   = secret && secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const pool = getPool()

  try {
    await pool.query(
      `UPDATE duplicate_signup_alerts SET resolved = true WHERE id = $1::uuid`,
      [id]
    )
    return Response.json({ ok: true })
  } catch (err) {
    console.error("[admin duplicate-alerts PATCH]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
