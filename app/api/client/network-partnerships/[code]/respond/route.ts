/**
 * app/api/client/network-partnerships/[code]/respond/route.ts
 *
 * Etapa 2, Fase 2 (2026-09-08) — Clube de Telas v2. O parceiro-alvo de um
 * pedido de divulgação (`network_partnerships.partner_code`) aprova ou
 * rejeita — regra de negócio: aprovação é sempre do dono da tela que vai
 * exibir, nunca do admin, nunca automática (spec v2, seção 1, regra 4).
 *
 * Ao aprovar: publica a peça na programação do parceiro
 * (`network_media_distribution`, válida por 30 dias) e gera 1 crédito de
 * reciprocidade pro dono original em `network_reciprocity_credits`.
 *
 * Uso: POST /api/client/network-partnerships/LEMEL186/respond
 * Body: { "partnership_id": "uuid", "decision": "accepted" | "rejected" }
 */

import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

const DISTRIBUTION_VALIDITY_DAYS = 30

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const partnershipId = body?.partnership_id
  const decision = body?.decision

  if (!partnershipId || !["accepted", "rejected"].includes(decision)) {
    return NextResponse.json(
      { error: "partnership_id e decision ('accepted' ou 'rejected') são obrigatórios" },
      { status: 400 }
    )
  }

  const pool = getPool()

  try {
    const { rows: partnershipRows } = await pool.query(
      `SELECT id, requester_code, partner_code, status, media_id FROM network_partnerships WHERE id = $1`,
      [partnershipId]
    )
    const partnership = partnershipRows[0]

    if (!partnership) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Só o parceiro-alvo (quem vai exibir) pode aprovar/rejeitar — nunca o
    // próprio requester, nunca admin. Esta é a mudança de regra central da
    // Fase 2: a rota antiga (app/api/admin/network-partnerships/respond)
    // permitia qualquer um dos dois lados responder; aqui é travado.
    if (partnership.partner_code !== upperCode) {
      return NextResponse.json(
        { error: "Só o parceiro que vai exibir pode responder este pedido" },
        { status: 403 }
      )
    }

    if (partnership.status !== "pending") {
      return NextResponse.json(
        { error: `Este pedido já está com status '${partnership.status}' e não pode ser respondido novamente` },
        { status: 409 }
      )
    }

    if (!partnership.media_id) {
      return NextResponse.json(
        { error: "Pedido sem peça associada — não é um pedido por-peça válido" },
        { status: 400 }
      )
    }

    const { rows: updatedRows } = await pool.query(
      `
      UPDATE network_partnerships
      SET status = $1, responded_at = now()
      WHERE id = $2
      RETURNING id, requester_code, partner_code, status, distance_km, media_id, responded_at
      `,
      [decision, partnershipId]
    )

    if (decision === "accepted") {
      // Publica a peça na programação do parceiro, válida por 30 dias.
      await pool.query(
        `
        INSERT INTO network_media_distribution
          (network_media_id, displayed_on_code, active, published_at, expires_at, extended)
        VALUES ($1, $2, true, now(), now() + interval '${DISTRIBUTION_VALIDITY_DAYS} days', false)
        ON CONFLICT (network_media_id, displayed_on_code) DO UPDATE SET
          active = true,
          published_at = now(),
          expires_at = now() + interval '${DISTRIBUTION_VALIDITY_DAYS} days',
          extended = false
        `,
        [partnership.media_id, upperCode]
      )

      // Gera 1 crédito de reciprocidade pro dono original, usável em
      // qualquer parceiro — contador perpétuo, sem expiração (decidido
      // 2026-09-08, spec v2 seção 4, pergunta 3).
      await pool.query(
        `
        INSERT INTO network_reciprocity_credits (owner_code, credit_with_code, available_count, updated_at)
        VALUES ($1, $2, 1, now())
        ON CONFLICT (owner_code, credit_with_code) DO UPDATE SET
          available_count = network_reciprocity_credits.available_count + 1,
          updated_at = now()
        `,
        [partnership.requester_code, upperCode]
      )

      await pool.query(
        `UPDATE network_partnerships SET credit_generated = true WHERE id = $1`,
        [partnershipId]
      )
    }

    return NextResponse.json({
      message: decision === "accepted" ? "Pedido aprovado e publicado." : "Pedido rejeitado.",
      partnership: updatedRows[0],
    })
  } catch (err) {
    console.error("[client/network-partnerships respond]", err)
    return NextResponse.json({ error: "Erro ao processar resposta do pedido" }, { status: 500 })
  }
}
