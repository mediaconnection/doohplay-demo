/**
 * app/api/admin/network-partnerships/suggest/route.ts
 *
 * Gera sugestões de parceiros para o Clube de Telas do Bairro.
 *
 * Regras aplicadas:
 *  - Raio de até 5km (calculado via Haversine sobre client_locations)
 *  - Exclui clientes do mesmo business_type (regra de não-concorrência)
 *  - Respeita o limite de 30 parceiros aceitos por cliente
 *  - Não duplica sugestões já existentes (qualquer status) entre o mesmo par
 *
 * Uso: POST /api/admin/network-partnerships/suggest
 * Body: { "client_code": "BARBE332" }
 *
 * Resultado: cria registros em network_partnerships com status 'suggested'
 * para os melhores candidatos encontrados (não cria se não houver candidatos).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPool } from "@/lib/db";
import { calculateDistanceKm } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

const MAX_PARTNERS_PER_CLIENT = 30;
const MAX_RADIUS_KM = 5;

interface ClientLocationRow {
  code: string;
  name: string;
  business_type: string | null;
  latitude: number;
  longitude: number;
}

export async function POST(req: NextRequest) {
  // Mesmo padrão de auth usado nas demais rotas admin
  const session = await getServerSession();
  const secret = req.nextUrl.searchParams.get("secret");

  const isNextAuth = !!session?.user;
  const isLegacy = secret && secret === process.env.ADMIN_SECRET;

  if (!isNextAuth && !isLegacy) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const clientCode = body?.client_code;

  if (!clientCode || typeof clientCode !== "string") {
    return NextResponse.json(
      { error: "client_code é obrigatório no corpo da requisição" },
      { status: 400 }
    );
  }

  const pool = getPool();

  try {
    // 1. Busca o cliente de origem com sua localização e tipo de negócio
    const { rows: originRows } = await pool.query<ClientLocationRow>(
      `
      SELECT sc.code, sc.name, sc.business_type, cl.latitude, cl.longitude
      FROM studio_clients sc
      JOIN client_locations cl ON cl.client_code = sc.code
      WHERE sc.code = $1 AND sc.active = true
      `,
      [clientCode]
    );

    const origin = originRows[0];

    if (!origin) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado, inativo, ou ainda sem geocodificação em client_locations",
        },
        { status: 404 }
      );
    }

    // 2. Checa quantos parceiros aceitos esse cliente já tem (limite de 30)
    const { rows: acceptedCountRows } = await pool.query<{ count: string }>(
      `
      SELECT count(*)::text AS count
      FROM network_partnerships
      WHERE status = 'accepted'
        AND (requester_code = $1 OR partner_code = $1)
      `,
      [clientCode]
    );

    const acceptedCount = parseInt(acceptedCountRows[0]?.count ?? "0", 10);
    const remainingSlots = MAX_PARTNERS_PER_CLIENT - acceptedCount;

    if (remainingSlots <= 0) {
      return NextResponse.json({
        message: "Cliente já atingiu o limite de 30 parceiros aceitos.",
        accepted_count: acceptedCount,
        suggestions_created: 0,
      });
    }

    // 3. Busca todos os outros clientes ativos e geocodificados,
    //    exceto o próprio, e exceto pares já existentes em qualquer status
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
      [clientCode]
    );

    // 4. Aplica as regras de negócio: raio de 5km + não-concorrente (mesmo business_type)
    type CandidateWithDistance = ClientLocationRow & { distance_km: number };

    const withDistance: CandidateWithDistance[] = candidates.map((candidate: ClientLocationRow) => ({
      ...candidate,
      distance_km: calculateDistanceKm(
        origin.latitude,
        origin.longitude,
        candidate.latitude,
        candidate.longitude
      ),
    }));

    const eligible = withDistance
      .filter((candidate) => candidate.distance_km <= MAX_RADIUS_KM)
      .filter((candidate) => {
        // Bloqueia mesmo business_type (concorrente direto).
        // Se algum dos dois não tiver business_type definido, não bloqueia por precaução.
        if (!origin.business_type || !candidate.business_type) return true;
        return candidate.business_type !== origin.business_type;
      })
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, remainingSlots);

    if (eligible.length === 0) {
      return NextResponse.json({
        message: "Nenhum candidato elegível encontrado dentro de 5km e sem conflito de categoria.",
        accepted_count: acceptedCount,
        remaining_slots: remainingSlots,
        suggestions_created: 0,
      });
    }

    // 5. Cria as sugestões em lote
    const insertedSuggestions = [];
    for (const candidate of eligible) {
      const { rows } = await pool.query(
        `
        INSERT INTO network_partnerships (requester_code, partner_code, status, distance_km)
        VALUES ($1, $2, 'suggested', $3)
        ON CONFLICT (requester_code, partner_code) DO NOTHING
        RETURNING id, requester_code, partner_code, distance_km
        `,
        [clientCode, candidate.code, candidate.distance_km.toFixed(2)]
      );

      if (rows[0]) {
        insertedSuggestions.push({
          ...rows[0],
          partner_name: candidate.name,
          partner_business_type: candidate.business_type,
        });
      }
    }

    return NextResponse.json({
      message: `${insertedSuggestions.length} sugestão(ões) de parceria criada(s).`,
      origin: { code: origin.code, name: origin.name, business_type: origin.business_type },
      accepted_count: acceptedCount,
      remaining_slots: remainingSlots,
      suggestions_created: insertedSuggestions.length,
      suggestions: insertedSuggestions,
    });
  } catch (err) {
    console.error("[network-partnerships/suggest] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao gerar sugestões de parceria" },
      { status: 500 }
    );
  }
}
