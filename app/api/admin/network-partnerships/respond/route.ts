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
import { countActivePartners } from "@/lib/network/countActivePartners";

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

    // 2. Se a decisão for aceitar, valida o limite de 30 parceiros
    // DISTINTOS pra AMBOS os lados. Fase 5 (2026-09-08): trocado pra
    // countActivePartners, a mesma função usada em suggest/route.ts e no
    // novo endpoint de cliente — antes contava linhas (COUNT(*)), o que
    // superestima desde que unique_partnership foi removida na Fase 1 (o
    // mesmo par pode ter várias linhas 'accepted' ao longo do tempo, uma
    // por peça, no modelo por-peça da Fase 2).
    if (decision === "accepted") {
      const [requesterCount, partnerCount] = await Promise.all([
        countActivePartners(pool, partnership.requester_code),
        countActivePartners(pool, partnership.partner_code),
      ]);

      const overLimitCode =
        requesterCount >= MAX_PARTNERS_PER_CLIENT
          ? partnership.requester_code
          : partnerCount >= MAX_PARTNERS_PER_CLIENT
          ? partnership.partner_code
          : null;

      if (overLimitCode) {
        return NextResponse.json(
          {
            error: `Cliente ${overLimitCode} já atingiu o limite de ${MAX_PARTNERS_PER_CLIENT} parceiros aceitos. Não é possível aceitar esta parceria.`,
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

    // Etapa 2, Fase 2 (2026-09-08): removida a distribuição automática em
    // massa que existia aqui (aceitar a parceria distribuía TODA a mídia já
    // aprovada de cada lado pro outro). Modelo novo é por-peça: aceite de
    // uma parceria "suggested" aqui só marca o pareamento como disponível —
    // a distribuição de verdade agora só acontece via aprovação de um
    // pedido específico (media_id), em
    // POST /api/client/network-partnerships/[code]/respond, feita pelo
    // dono da tela que vai exibir, nunca automática nem pelo admin.

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
