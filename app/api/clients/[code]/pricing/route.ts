// app/api/admin/clients/[code]/pricing/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const VALID_SIZES = ["pequena", "media", "grande"]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession()
  const body = await req.json()
  if (!session?.user && !(body.secret && body.secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { code } = await params
  const { screen_size, price_multiplier } = body

  if (screen_size && !VALID_SIZES.includes(screen_size)) {
    return NextResponse.json({ error: `screen_size deve ser um de: ${VALID_SIZES.join(", ")}` }, { status: 400 })
  }
  const multiplier = price_multiplier !== undefined ? Number(price_multiplier) : null
  if (multiplier !== null && (isNaN(multiplier) || multiplier <= 0 || multiplier > 10)) {
    return NextResponse.json({ error: "price_multiplier deve ser um número entre 0 e 10" }, { status: 400 })
  }

  const pool = getPool()
  try {
    const res = await pool.query(
      `UPDATE studio_clients
       SET screen_size = COALESCE($1, screen_size),
           price_multiplier = COALESCE($2, price_multiplier)
       WHERE code = $3
       RETURNING code, screen_size, price_multiplier`,
      [screen_size ?? null, multiplier, code.toUpperCase()]
    )
    if (!res.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, ...res.rows[0] })
  } catch (err: any) {
    console.error("[admin/clients/pricing PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
