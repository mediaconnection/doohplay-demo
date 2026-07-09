import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { requireSuperAdmin } from "@/lib/require-super-admin"

export const dynamic = "force-dynamic"

// GET — lista todos os admins cadastrados (nunca devolve o hash da senha)
export async function GET(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id, name, email, role, active, created_at, last_login_at
     FROM admin_users ORDER BY created_at ASC`
  )
  return NextResponse.json({ users: rows })
}

// POST — cria um admin novo
export async function POST(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { name, email, password, role } = await req.json()
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return NextResponse.json({ error: "Nome, email e senha (mín. 8 caracteres) são obrigatórios" }, { status: 400 })
    }
    const finalRole = role === "super_admin" ? "super_admin" : "operador"

    const pool = getPool()
    const existing = await pool.query(`SELECT id FROM admin_users WHERE email = $1`, [email.trim().toLowerCase()])
    if (existing.rows[0]) return NextResponse.json({ error: "Já existe um admin com esse email" }, { status: 400 })

    const res = await pool.query(
      `INSERT INTO admin_users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, active, created_at`,
      [name.trim(), email.trim().toLowerCase(), hashPassword(password), finalRole]
    )
    return NextResponse.json({ ok: true, user: res.rows[0] })
  } catch (err: any) {
    console.error("[admin/users POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — ativa/desativa um admin (nunca apaga — histórico de quem fez o quê continua íntegro)
export async function PATCH(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { id, active, role } = await req.json()
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const pool = getPool()
    if (typeof active === "boolean") {
      await pool.query(`UPDATE admin_users SET active = $1 WHERE id = $2`, [active, id])
    }
    if (role === "super_admin" || role === "operador") {
      await pool.query(`UPDATE admin_users SET role = $1 WHERE id = $2`, [role, id])
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[admin/users PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
