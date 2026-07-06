import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — lista enquetes (todas, ou de um client_code específico)
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const clientCode = req.nextUrl.searchParams.get("client_code")
  const pool = getPool()
  const { rows } = await pool.query(
    clientCode
      ? `SELECT id, client_code, question, options, active, created_at FROM polls WHERE client_code = $1 ORDER BY created_at DESC`
      : `SELECT id, client_code, question, options, active, created_at FROM polls ORDER BY created_at DESC`,
    clientCode ? [clientCode.toUpperCase()] : []
  )
  return NextResponse.json({ items: rows })
}

// POST — cria uma enquete nova
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { client_code, question, options } = await req.json()
    if (!client_code || !question?.trim()) {
      return NextResponse.json({ error: "client_code e question são obrigatórios" }, { status: 400 })
    }
    const clean = (options || []).map((o: string) => String(o).trim()).filter(Boolean)
    if (clean.length < 2 || clean.length > 4) {
      return NextResponse.json({ error: "Precisa ter entre 2 e 4 opções" }, { status: 400 })
    }
    const pool = getPool()
    const { rows } = await pool.query(
      `INSERT INTO polls (client_code, question, options) VALUES ($1, $2, $3) RETURNING id`,
      [client_code.toUpperCase(), question.trim(), clean]
    )
    return NextResponse.json({ ok: true, id: rows[0].id })
  } catch (err: any) {
    console.error("[admin/polls POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — ativa/desativa uma enquete (?id=)
export async function PATCH(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
  try {
    const { active } = await req.json()
    const pool = getPool()
    await pool.query(`UPDATE polls SET active = $1 WHERE id = $2`, [!!active, id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove uma enquete (?id=)
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
  const pool = getPool()
  await pool.query(`DELETE FROM polls WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
