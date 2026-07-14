// app/api/admin/players/link/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET — lista dispositivos aguardando pareamento (paired = false), pra
// admin escolher qual vincular a qual cliente, sem precisar de SQL manual.
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const pending = await pool.query(
    `SELECT p.id, p.device_type, p.platform, p.created_at
     FROM players p
     WHERE (p.paired = false OR p.paired IS NULL)
       AND p.tenant_id IS NULL
       AND p.id NOT IN (SELECT player_id FROM studio_clients WHERE player_id IS NOT NULL)
       AND p.device_fingerprint IS NOT NULL
     ORDER BY p.created_at DESC
     LIMIT 50`
  )
  return NextResponse.json({ pending: pending.rows })
}

// POST — vincula um player_id (já ativado, ainda não pareado) a um código
// de cliente real (studio_clients.code). Atualiza os dois lados:
// players.paired/player_code e studio_clients.player_id.
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  const body = await req.json()
  const secret = body.secret
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { player_id, code } = body
  if (!player_id || !code) {
    return NextResponse.json({ error: "player_id e code são obrigatórios" }, { status: 400 })
  }

  const pool = getPool()
  try {
    const client = await pool.query(
      `SELECT code, name FROM studio_clients WHERE UPPER(code) = UPPER($1) LIMIT 1`,
      [code]
    )
    if (!client.rows[0]) {
      return NextResponse.json({ error: "Código de cliente não encontrado" }, { status: 404 })
    }

    await pool.query(
      `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1 WHERE id = $2`,
      [client.rows[0].code, player_id]
    )
    await pool.query(
      `UPDATE studio_clients SET player_id = $1 WHERE code = $2`,
      [player_id, client.rows[0].code]
    )

    return NextResponse.json({ ok: true, code: client.rows[0].code, name: client.rows[0].name })
  } catch (err: any) {
    console.error("[admin/players/link POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — descarta um dispositivo aguardando pareamento (aparelho de
// teste, reinstalação, etc). Só apaga se ainda estiver de fato pendente
// (paired=false/null, sem cliente vinculado) — trava de segurança pra
// nunca remover sem querer uma tela que já está em uso de verdade.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const playerId = req.nextUrl.searchParams.get("player_id")
  if (!playerId) {
    return NextResponse.json({ error: "player_id é obrigatório" }, { status: 400 })
  }

  const pool = getPool()
  try {
    // Limpa qualquer token de pareamento pendente pra esse aparelho antes
    // de apagar o player em si — evita linha órfã em player_pairing_tokens.
    await pool.query(`DELETE FROM player_pairing_tokens WHERE player_id = $1`, [playerId])

    // Achado em produção (14/07/2026): screen_purchase_requests.player_id
    // tem FK obrigatória pra players(id) — sem limpar isso primeiro, o
    // DELETE de players falhava com "violates foreign key constraint"
    // pra qualquer aparelho que já tivesse testado/iniciado uma compra de
    // tela extra (ex: "Teste Pix E2E"). Só apaga pedido nunca pago
    // (status != 'paid') — se por algum motivo existir um pedido PAGO
    // amarrado a um aparelho ainda "pendente" (não deveria acontecer,
    // mas por segurança), o DELETE de players abaixo falha e avisa,
    // em vez de apagar silenciosamente um registro financeiro real.
    await pool.query(
      `DELETE FROM screen_purchase_requests WHERE player_id = $1 AND status != 'paid'`,
      [playerId]
    )

    const { rows } = await pool.query(
      `DELETE FROM players
       WHERE id = $1
         AND (paired = false OR paired IS NULL)
         AND id NOT IN (SELECT player_id FROM studio_clients WHERE player_id IS NOT NULL)
       RETURNING id`,
      [playerId]
    )
    if (!rows[0]) {
      return NextResponse.json({ error: "Dispositivo não encontrado ou já está vinculado a um cliente (não descartado por segurança)" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, removed: rows[0].id })
  } catch (err: any) {
    console.error("[admin/players/link DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
