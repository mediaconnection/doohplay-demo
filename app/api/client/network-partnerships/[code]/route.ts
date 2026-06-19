/**
 * app/api/client/network-partnerships/[code]/route.ts
 *
 * Retorna as parcerias do Clube de Telas de um cliente, separadas em:
 *  - suggestions: status 'suggested' ou 'pending' onde este cliente é parte
 *  - accepted: status 'accepted' onde este cliente é parte
 *
 * Cada item já vem com nome e categoria do OUTRO lado da parceria resolvidos,
 * para a UI não precisar fazer lookups adicionais.
 *
 * Uso: GET /api/client/network-partnerships/BARBE332
 */

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const pool = getPool();

  try {
    interface PartnershipDisplayRow {
      id: string;
      requester_code: string;
      partner_code: string;
      status: string;
      distance_km: string | null;
      created_at: string;
      responded_at: string | null;
      partner_name: string | null;
      partner_business_type: string | null;
      partner_code_resolved: string;
    }

    const { rows } = await pool.query<PartnershipDisplayRow>(
      `
      SELECT
        np.id,
        np.requester_code,
        np.partner_code,
        np.status,
        np.distance_km,
        np.created_at,
        np.responded_at,
        -- Resolve o nome/categoria do OUTRO lado da parceria (não o próprio cliente)
        CASE WHEN np.requester_code = $1 THEN sc_partner.name ELSE sc_requester.name END
          AS partner_name,
        CASE WHEN np.requester_code = $1 THEN sc_partner.business_type ELSE sc_requester.business_type END
          AS partner_business_type,
        CASE WHEN np.requester_code = $1 THEN np.partner_code ELSE np.requester_code END
          AS partner_code_resolved
      FROM network_partnerships np
      LEFT JOIN studio_clients sc_partner   ON sc_partner.code   = np.partner_code
      LEFT JOIN studio_clients sc_requester ON sc_requester.code = np.requester_code
      WHERE np.requester_code = $1 OR np.partner_code = $1
      ORDER BY np.created_at DESC
      `,
      [code.toUpperCase()]
    );

    const suggestions = rows.filter(
      (r: PartnershipDisplayRow) => r.status === "suggested" || r.status === "pending"
    );
    const accepted = rows.filter((r: PartnershipDisplayRow) => r.status === "accepted");

    return NextResponse.json({ suggestions, accepted });
  } catch (err) {
    console.error("[client/network-partnerships GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
