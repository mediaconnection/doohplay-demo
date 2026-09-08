/**
 * app/api/client/network-partnerships/[code]/request/route.ts
 *
 * Etapa 2, Fase 2 (2026-09-08) — Clube de Telas v2. O dono de uma peça
 * institucional já aprovada (`network_media.status = 'approved'`) pede pra
 * divulgá-la num parceiro dentro de 5km. Cria a parceria já como pedido
 * por-peça (`status: 'pending'`, `media_id` preenchido) — quem aprova é o
 * parceiro-alvo, nunca automático (ver .../[code]/respond/route.ts).
 *
 * Uso: POST /api/client/network-partnerships/BARBE332/request
 * Body: { "media_id": "uuid", "partner_code": "LEMEL186" }
 */

import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { calculateDistanceKm } from "@/lib/geocoding"

export const dynamic = "force-dynamic"

const MAX_RADIUS_KM = 5

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
  const mediaId = body?.media_id
  const partnerCode = typeof body?.partner_code === "string" ? body.partner_code.toUpperCase() : null

  if (!mediaId || !partnerCode) {
    return NextResponse.json({ error: "media_id e partner_code são obrigatórios" }, { status: 400 })
  }

  if (partnerCode === upperCode) {
    return NextResponse.json({ error: "Não é possível pedir divulgação pra si mesmo" }, { status: 400 })
  }

  const pool = getPool()

  try {
    // Peça precisa ser do próprio dono e já aprovada pela DOOHPLAY (gate de
    // qualidade/brand-safety em app/api/admin/network-media/[id]/route.ts).
    const { rows: mediaRows } = await pool.query(
      `SELECT id FROM network_media WHERE id = $1 AND owner_code = $2 AND status = 'approved' LIMIT 1`,
      [mediaId, upperCode]
    )
    if (!mediaRows[0]) {
      return NextResponse.json(
        { error: "Peça não encontrada, não pertence a este cliente, ou ainda não foi aprovada" },
        { status: 404 }
      )
    }

    // Distância recalculada agora (não confia em sugestão antiga, que pode
    // ter sido gerada há tempos e as coordenadas podem ter mudado).
    const { rows: locRows } = await pool.query(
      `
      SELECT
        origin.latitude  AS origin_lat, origin.longitude  AS origin_lon,
        target.latitude  AS target_lat, target.longitude  AS target_lon
      FROM client_locations origin, client_locations target
      WHERE origin.client_code = $1 AND target.client_code = $2
      `,
      [upperCode, partnerCode]
    )
    const loc = locRows[0]
    if (!loc) {
      return NextResponse.json(
        { error: "Cliente ou parceiro sem coordenadas cadastradas em client_locations" },
        { status: 404 }
      )
    }

    const distanceKm = calculateDistanceKm(loc.origin_lat, loc.origin_lon, loc.target_lat, loc.target_lon)
    if (distanceKm > MAX_RADIUS_KM) {
      return NextResponse.json(
        { error: `Parceiro fora do raio de ${MAX_RADIUS_KM}km (${distanceKm.toFixed(2)}km de distância)` },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `
      INSERT INTO network_partnerships (requester_code, partner_code, status, distance_km, media_id)
      VALUES ($1, $2, 'pending', $3, $4)
      RETURNING id, requester_code, partner_code, status, distance_km, media_id, created_at
      `,
      [upperCode, partnerCode, distanceKm.toFixed(2), mediaId]
    )

    return NextResponse.json({ ok: true, partnership: rows[0] })
  } catch (err) {
    console.error("[client/network-partnerships request]", err)
    return NextResponse.json({ error: "Erro ao criar pedido de divulgação" }, { status: 500 })
  }
}
