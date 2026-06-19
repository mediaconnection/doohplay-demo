/**
 * app/api/admin/network-partnerships/respond/route.ts
 *
 * Permite que um dos dois lados de uma parceria sugerida (requester ou partner)
 * aceite ou rejeite. Reflete a decisão estratégica de aprovação híbrida:
 * o sistema sugere, o dono confirma com 1 clique.
 *
 * Uso: POST /api/admin/network-partnerships/respond
 * Body: {
 *   "partnership_id": "uuid",
 *   "responding_client_code": "BARBE332",
 *   "decision": "accepted" | "rejected"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_PARTNERS_PER_CLIENT = 30;

interface PartnershipRow {
  id: string;
  requester_code: string;
  partner_code: string;
  status: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const secret = req.nextUrl.searchParams.get("secret");

  const isNextAuth = !!session?.user;
  const isLegacy = secret && secret === process.env.ADMIN_SECRET;

  if (!isNextAuth && !isLegacy) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const partnershipId = body?.partnership_id;
  const respondingCode = body?.responding_client_code;
  const decision = body?.decision;

  if (!partnershipId || !respondingCode || !["accepted", "rejected"].includes(decision)) {
    return NextResponse.json(
      {
        error:
          "partnership_id, responding_client_code e decision ('accepted' ou 'rejected') são obrigatórios",
      },
      { status: 400 }
    );
  }

  const pool = getPool();

  try {
    // 1. Busca a parceria e valida que o respondente é parte dela
    const { rows: partnershipRows } = await pool.query<PartnershipRow>(
      `SELECT id, requester_code, partner_code, status FROM network_partnerships WHERE id = $1`,
      [partnershipId]
    );

    const partnership = partnershipRows[0];

    if (!partnership) {
      return NextResponse.json({ error: "Parceria não encontrada" }, { status: 404 });
    }

    if (
      partnership.requester_code !== respondingCode &&
      partnership.partner_code !== respondingCode
    ) {
      return NextResponse.json(
        { error: "Este cliente não faz parte desta parceria" },
        { status: 403 }
      );
    }

    if (partnership.status !== "suggested" && partnership.status !== "pending") {
      return NextResponse.json(
        {
          error: `Esta parceria já está com status '${partnership.status}' e não pode ser respondida novamente`,
        },
        { status: 409 }
      );
    }

    // 2. Se a decisão for aceitar, valida o limite de 30 parceiros para AMBOS os lados
    if (decision === "accepted") {
      const { rows: countRows } = await pool.query<{ code: string; count: string }>(
        `
        SELECT code, count(*)::text AS count
        FROM (
          SELECT $1::text AS code
        ) base
        LEFT JOIN network_partnerships np
          ON np.status = 'accepted'
          AND (np.requester_code = base.code OR np.partner_code = base.code)
        GROUP BY code

        UNION ALL

        SELECT code, count(*)::text AS count
        FROM (
          SELECT $2::text AS code
        ) base
        LEFT JOIN network_partnerships np
          ON np.status = 'accepted'
          AND (np.requester_code = base.code OR np.partner_code = base.code)
        GROUP BY code
        `,
        [partnership.requester_code, partnership.partner_code]
      );

      const overLimit = countRows.find(
        (row: { code: string; count: string }) => parseInt(row.count, 10) >= MAX_PARTNERS_PER_CLIENT
      );

      if (overLimit) {
        return NextResponse.json(
          {
            error: `Cliente ${overLimit.code} já atingiu o limite de ${MAX_PARTNERS_PER_CLIENT} parceiros aceitos. Não é possível aceitar esta parceria.`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Atualiza o status
    const { rows: updatedRows } = await pool.query<{
      id: string;
      requester_code: string;
      partner_code: string;
      status: string;
      distance_km: string | null;
      responded_at: string;
    }>(
      `
      UPDATE network_partnerships
      SET status = $1, responded_at = now()
      WHERE id = $2
      RETURNING id, requester_code, partner_code, status, distance_km, responded_at
      `,
      [decision, partnershipId]
    );

    return NextResponse.json({
      message:
        decision === "accepted"
          ? "Parceria aceita com sucesso."
          : "Parceria rejeitada.",
      partnership: updatedRows[0],
    });
  } catch (err) {
    console.error("[network-partnerships/respond] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao processar resposta da parceria" },
      { status: 500 }
    );
  }
}
