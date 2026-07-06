import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// POST — aplica um layout_template_id a todas as telas de um grupo, de uma
// vez. Antes disso só dava pra configurar layout por client_code inteiro
// (todas as telas daquele cliente); aqui gravamos por screen_id específico,
// que a leitura (getPlayerData) já sabe priorizar — só nunca tinha sido
// usado na prática.
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { group_id, layout_template_id } = await req.json()
    if (!group_id || !layout_template_id) {
      return NextResponse.json({ error: "group_id e layout_template_id são obrigatórios" }, { status: 400 })
    }
    const pool = getPool()

    const { rows: members } = await pool.query(
      `SELECT cs.id AS screen_id, cs.client_code
       FROM fleet_group_members fgm
       JOIN client_screens cs ON cs.id = fgm.screen_id
       WHERE fgm.fleet_group_id = $1`,
      [group_id]
    )

    let applied = 0
    for (const m of members) {
      const existing = await pool.query(
        `SELECT id FROM screen_templates WHERE client_code = $1 AND screen_id = $2 LIMIT 1`,
        [m.client_code, m.screen_id]
      )
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE screen_templates SET layout_template_id = $1, active = true, updated_at = NOW() WHERE id = $2`,
          [layout_template_id, existing.rows[0].id]
        )
      } else {
        await pool.query(
          `INSERT INTO screen_templates (client_code, screen_id, template_key, layout_template_id)
           VALUES ($1, $2, 'fullscreen', $3)`,
          [m.client_code, m.screen_id, layout_template_id]
        )
      }
      applied++
    }

    return NextResponse.json({ ok: true, applied })
  } catch (err: any) {
    console.error("[admin/fleet/bulk-layout POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
