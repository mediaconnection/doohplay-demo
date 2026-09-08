// app/api/cron/network-partnerships-timeout/route.ts
//
// Etapa 2, Fase 3 (2026-09-08) — Clube de Telas v2. Marca como
// `expired_no_response` qualquer pedido de divulgação (`network_partnerships`,
// modelo por-peça da Fase 2) parado em `pending` há 15 dias sem resposta do
// parceiro-alvo, e avisa o dono que pediu (`requester_code`) via WhatsApp.
// Reaproveita o módulo centralizado `lib/whatsapp.ts` (já com checagem de
// `res.ok` corrigida nesta sessão) em vez de duplicar a função de envio —
// mesmo achado de duplicação já corrigido em 7 outras rotas hoje.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

const TIMEOUT_DAYS = 15
const CRON_SECRET = process.env.CRON_SECRET!

interface ExpiredRequestRow {
  id: string
  requester_code: string
  partner_code: string
  requester_name: string | null
  requester_phone: string | null
  partner_name: string | null
  media_name: string | null
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const results: { id: string; requester_code: string; notified: boolean }[] = []

  try {
    const { rows } = await pool.query<ExpiredRequestRow>(
      `
      SELECT
        np.id, np.requester_code, np.partner_code,
        sc.name AS requester_name, sc.phone AS requester_phone,
        scp.name AS partner_name,
        nm.name AS media_name
      FROM network_partnerships np
      JOIN studio_clients sc ON sc.code = np.requester_code
      LEFT JOIN studio_clients scp ON scp.code = np.partner_code
      LEFT JOIN network_media nm ON nm.id = np.media_id
      WHERE np.status = 'pending'
        AND np.media_id IS NOT NULL
        AND np.created_at < now() - interval '${TIMEOUT_DAYS} days'
      `
    )

    console.log(`[network-partnerships-timeout] ${rows.length} pedido(s) expirado(s) encontrado(s)`)

    for (const row of rows) {
      await pool.query(
        `UPDATE network_partnerships SET status = 'expired_no_response' WHERE id = $1`,
        [row.id]
      )

      let notified = false
      if (row.requester_phone) {
        const msg =
          `⏳ *DOOHPLAY — Pedido sem resposta*\n\n` +
          `Olá, *${row.requester_name}*!\n` +
          `Seu pedido de divulgação` +
          (row.media_name ? ` da peça *${row.media_name}*` : "") +
          ` pro parceiro *${row.partner_name ?? row.partner_code}* passou de ${TIMEOUT_DAYS} dias sem resposta e expirou.\n\n` +
          `Você pode enviar um novo pedido pelo Studio quando quiser.\n\n` +
          `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`

        notified = await sendWhatsApp(row.requester_phone, msg)
      }

      results.push({ id: row.id, requester_code: row.requester_code, notified })
    }

    return NextResponse.json({
      ok: true,
      expired: results.length,
      results,
      ts: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[network-partnerships-timeout]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
