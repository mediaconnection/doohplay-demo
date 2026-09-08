/**
 * app/api/client/network-partnerships/[code]/candidates/route.ts
 *
 * Etapa 2, item 3 (2026-09-08) — Clube de Telas v2. Lista de
 * estabelecimentos dentro de 5km que o próprio cliente pode escolher pra
 * pedir divulgação (fluxo de auto-descoberta, spec v2 seção 3, passo 1).
 *
 * Mesma lógica de elegibilidade de app/api/admin/network-partnerships/suggest/route.ts
 * (raio de 5km, exclui mesmo business_type, exclui pares já existentes em
 * qualquer status) — mas só LEITURA, autenticada por sessão de cliente, e
 * NÃO insere nenhuma linha em network_partnerships. O pedido de verdade só
 * acontece quando o cliente escolhe um candidato e chama
 * POST .../[code]/request.
 *
 * Uso: GET /api/client/network-partnerships/BARBE332/candidates
 */

import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { calculateDistanceKm } from "@/lib/geocoding"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { countActivePartners } from "@/lib/network/countActivePartners"

export const dynamic = "force-dynamic"

const MAX_PARTNERS_PER_CLIENT = 30
const MAX_RADIUS_KM = 5

interface ClientLocationRow {
  code: string
  name: string
  business_type: string | null
  latitude: number
  longitude: number
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()

  try {
    const { rows: originRows } = await pool.query<ClientLocationRow>(
      `
      SELECT sc.code, sc.name, sc.business_type, cl.latitude, cl.longitude
      FROM studio_clients sc
      JOIN client_locations cl ON cl.client_code = sc.code
      WHERE sc.code = $1 AND sc.active = true
      `,
      [upperCode]
    )
    const origin = originRows[0]

    if (!origin) {
      return NextResponse.json(
        { error: "Cliente não encontrado, inativo, ou ainda sem geocodificação em client_locations" },
        { status: 404 }
      )
    }

    const acceptedCount = await countActivePartners(pool, upperCode)
    const remainingSlots = MAX_PARTNERS_PER_CLIENT - acceptedCount

    if (remainingSlots <= 0) {
      return NextResponse.json({
        candidates: [],
        remaining_slots: 0,
        message: "Você já atingiu o limite de 30 parceiros aceitos.",
      })
    }

    const { rows: candidates } = await pool.query<ClientLocationRow>(
      `
      SELECT sc.code, sc.name, sc.business_type, cl.latitude, cl.longitude
      FROM studio_clients sc
      JOIN client_locations cl ON cl.client_code = sc.code
      WHERE sc.code <> $1
        AND sc.active = true
        AND NOT EXISTS (
          SELECT 1 FROM network_partnerships np
          WHERE (np.requester_code = $1 AND np.partner_code = sc.code)
             OR (np.requester_code = sc.code AND np.partner_code = $1)
        )
      `,
      [upperCode]
    )

    type CandidateWithDistance = { code: string; name: string; business_type: string | null; distance_km: number }

    const eligible: CandidateWithDistance[] = candidates
      .map((c: ClientLocationRow) => ({
        code: c.code,
        name: c.name,
        business_type: c.business_type,
        distance_km: calculateDistanceKm(origin.latitude, origin.longitude, c.latitude, c.longitude),
      }))
      .filter((c: CandidateWithDistance) => c.distance_km <= MAX_RADIUS_KM)
      .filter((c: CandidateWithDistance) => {
        // Mesma regra de não-concorrência do /suggest: bloqueia mesmo
        // business_type; se algum dos dois não tiver definido, não bloqueia
        // por precaução.
        if (!origin.business_type || !c.business_type) return true
        return c.business_type !== origin.business_type
      })
      .sort((a: CandidateWithDistance, b: CandidateWithDistance) => a.distance_km - b.distance_km)

    return NextResponse.json({
      candidates: eligible,
      remaining_slots: remainingSlots,
    })
  } catch (err) {
    console.error("[client/network-partnerships candidates]", err)
    return NextResponse.json({ error: "Erro ao buscar candidatos" }, { status: 500 })
  }
}
