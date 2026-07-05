// app/api/client/settings/[code]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.url.split("/").pop()?.toUpperCase()
  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT name, business_type, address, city, phone, email,
              cpf_cnpj, notif_whatsapp, notif_email, screen_orientation, primary_color
       FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code]
    )
    if (!rows[0]) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error("[settings GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const code = req.url.split("/").pop()?.toUpperCase()
  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const body = await req.json()
    const {
      name, business_type, address, city, phone, email,
      cpf_cnpj, notif_whatsapp, notif_email, screen_orientation, primary_color,
    } = body

    // Validações básicas
    if (!name?.trim())  return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    if (!phone?.trim()) return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })

    await pool.query(
      `UPDATE studio_clients SET
         name               = $1,
         business_type      = $2,
         address            = $3,
         city               = $4,
         phone              = $5,
         email              = $6,
         cpf_cnpj           = $7,
         notif_whatsapp     = $8,
         notif_email        = $9,
         screen_orientation = $10,
         primary_color      = $11
       WHERE code = $12`,
      [
        name.trim(),
        business_type?.trim() || null,
        address?.trim()       || null,
        city?.trim()          || null,
        phone.trim(),
        email?.trim()         || null,
        cpf_cnpj?.trim()      || null,
        notif_whatsapp ?? true,
        notif_email    ?? false,
        screen_orientation === "portrait" ? "portrait" : "landscape",
        /^#[0-9A-Fa-f]{6}$/.test(primary_color || "") ? primary_color : "#3B82F6",
        code,
      ]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[settings PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
