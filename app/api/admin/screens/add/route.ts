import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// POST — adiciona uma tela NOVA a um cliente que já existe (diferente do
// primeiro pareamento de players/link, que preenche studio_clients.player_id
// — um slot só). Aqui criamos uma linha em client_screens, permitindo
// quantas telas o cliente precisar (como V96+T600 já fazem pra BARBE332).
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { client_code, player_id, label } = await req.json()
    if (!client_code || !player_id || !label?.trim()) {
      return NextResponse.json({ error: "client_code, player_id e label são obrigatórios" }, { status: 400 })
    }

    const pool = getPool()
    const clientCode = String(client_code).toUpperCase()

    const client = await pool.query(`SELECT code FROM studio_clients WHERE code = $1 LIMIT 1`, [clientCode])
    if (!client.rows[0]) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    const player = await pool.query(`SELECT id FROM players WHERE id = $1 LIMIT 1`, [player_id])
    if (!player.rows[0]) return NextResponse.json({ error: "Dispositivo não encontrado" }, { status: 404 })

    const res = await pool.query(
      `INSERT INTO client_screens (client_code, player_id, label, same_content)
       VALUES ($1, $2, $3, true)
       RETURNING id`,
      [clientCode, player_id, label.trim()]
    )

    // Marca o dispositivo como pareado, igual ao fluxo de players/link
    await pool.query(
      `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1 WHERE id = $2`,
      [clientCode, player_id]
    )

    return NextResponse.json({ ok: true, id: res.rows[0].id })
  } catch (err: any) {
    console.error("[admin/screens/add POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
