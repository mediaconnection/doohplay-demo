import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// POST — cria um layout_template avulso (is_preset=false), sem vincular a
// nenhum cliente/screen_templates. Usado quando o layout é editado dentro
// do cadastro de um item institucional (Fase 9d) — o editor completo
// (arrastar/redimensionar/escolher tipo de bloco) sem precisar de um
// cliente já configurado.
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const name = String(body.name || "Layout personalizado")
    const orientation = body.orientation === "vertical" ? "vertical" : "horizontal"
    const zones = body.zones

    if (!Array.isArray(zones) || zones.length === 0) {
      return NextResponse.json({ error: "zones precisa ter pelo menos 1 bloco" }, { status: 400 })
    }
    for (const z of zones) {
      if (typeof z.x !== "number" || typeof z.y !== "number" || typeof z.w !== "number" || typeof z.h !== "number") {
        return NextResponse.json({ error: "cada zona precisa de x, y, w, h numéricos" }, { status: 400 })
      }
    }

    const pool = getPool()
    const res = await pool.query(
      `INSERT INTO layout_templates (name, orientation, zones, is_preset)
       VALUES ($1, $2, $3, false) RETURNING id`,
      [name, orientation, JSON.stringify(zones)]
    )
    return NextResponse.json({ ok: true, id: res.rows[0].id })
  } catch (err: any) {
    console.error("[admin/layout-templates/custom POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
