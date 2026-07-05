import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — lista os 10 presets, e opcionalmente o layout já em uso por um cliente
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  const clientCode = req.nextUrl.searchParams.get("client_code")

  const presets = await pool.query(
    `SELECT id, name, orientation, zones FROM layout_templates WHERE is_preset = true ORDER BY orientation, name`
  )

  let current = null
  if (clientCode) {
    const res = await pool.query(
      `SELECT lt.id, lt.name, lt.orientation, lt.zones
       FROM screen_templates st
       JOIN layout_templates lt ON lt.id = st.layout_template_id
       WHERE st.client_code = $1 AND st.active = true
       ORDER BY st.screen_id NULLS LAST
       LIMIT 1`,
      [clientCode.toUpperCase()]
    )
    current = res.rows[0] || null
  }

  return NextResponse.json({ presets: presets.rows, current })
}

// POST — salva um layout customizado (clona a partir de um preset ou edita o
// que já existe) e associa ao cliente via screen_templates.layout_template_id
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const clientCode = String(body.client_code || "").toUpperCase()
    const name = String(body.name || "Layout personalizado")
    const orientation = body.orientation === "vertical" ? "vertical" : "horizontal"
    const zones = body.zones

    if (!clientCode) return NextResponse.json({ error: "client_code é obrigatório" }, { status: 400 })
    if (!Array.isArray(zones) || zones.length === 0) {
      return NextResponse.json({ error: "zones precisa ter pelo menos 1 bloco" }, { status: 400 })
    }
    for (const z of zones) {
      if (typeof z.x !== "number" || typeof z.y !== "number" || typeof z.w !== "number" || typeof z.h !== "number") {
        return NextResponse.json({ error: "cada zona precisa de x, y, w, h numéricos" }, { status: 400 })
      }
    }

    const pool = getPool()

    // Reaproveita o layout_template já vinculado a esse cliente, se existir
    // (evita acumular uma linha nova toda vez que o admin salva de novo)
    const existingLink = await pool.query(
      `SELECT lt.id FROM screen_templates st
       JOIN layout_templates lt ON lt.id = st.layout_template_id
       WHERE st.client_code = $1 AND st.screen_id IS NULL AND lt.is_preset = false
       LIMIT 1`,
      [clientCode]
    )

    let layoutId: string
    if (existingLink.rows[0]) {
      const res = await pool.query(
        `UPDATE layout_templates SET name = $1, orientation = $2, zones = $3, updated_at = NOW()
         WHERE id = $4 RETURNING id`,
        [name, orientation, JSON.stringify(zones), existingLink.rows[0].id]
      )
      layoutId = res.rows[0].id
    } else {
      const res = await pool.query(
        `INSERT INTO layout_templates (name, orientation, zones, is_preset)
         VALUES ($1, $2, $3, false) RETURNING id`,
        [name, orientation, JSON.stringify(zones)]
      )
      layoutId = res.rows[0].id
    }

    // Vincula ao cliente via screen_templates (cria a linha se não existir ainda)
    const existingScreenTemplate = await pool.query(
      `SELECT id FROM screen_templates WHERE client_code = $1 AND screen_id IS NULL LIMIT 1`,
      [clientCode]
    )
    if (existingScreenTemplate.rows[0]) {
      await pool.query(
        `UPDATE screen_templates SET layout_template_id = $1, active = true, updated_at = NOW() WHERE id = $2`,
        [layoutId, existingScreenTemplate.rows[0].id]
      )
    } else {
      await pool.query(
        `INSERT INTO screen_templates (client_code, template_key, layout_template_id)
         VALUES ($1, 'fullscreen', $2)`,
        [clientCode, layoutId]
      )
    }

    return NextResponse.json({ ok: true, layout_template_id: layoutId })
  } catch (err: any) {
    console.error("[admin/layout-templates POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove o layout customizado de um cliente, voltando ao template_key antigo
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const clientCode = req.nextUrl.searchParams.get("client_code")?.toUpperCase()
  if (!clientCode) return NextResponse.json({ error: "client_code é obrigatório" }, { status: 400 })

  const pool = getPool()
  await pool.query(
    `UPDATE screen_templates SET layout_template_id = NULL WHERE client_code = $1`,
    [clientCode]
  )
  return NextResponse.json({ ok: true })
}
