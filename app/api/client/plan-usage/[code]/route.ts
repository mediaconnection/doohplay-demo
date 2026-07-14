// app/api/client/plan-usage/[code]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { PLANS, PlanKey, PLAN_AI_GENERATION_LIMITS, DEFAULT_AI_GENERATION_LIMIT } from "@/lib/asaas"

export const dynamic = "force-dynamic"

// GET — plano contratado + quantas telas o cliente tem vinculadas hoje.
// Achado numa sessão de revisão (11/07/2026): desvincular uma tela nunca
// mexe na assinatura (decisão consciente, ver conversa) — mas o cliente
// não tinha nenhuma visibilidade de quantas telas o plano dele cobre nem
// quantas está usando. Isso aqui só mostra o número; não muda cobrança.
//
// Fase 17 (13/07/2026): também mostra quantas gerações de IA (Studio) o
// cliente já usou este mês, e o limite do plano — mesma lógica de
// visibilidade, sem mudar nenhuma cobrança.
export async function GET(req: NextRequest) {
  const code = req.url.split("/").pop()?.toUpperCase()
  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const [subRow, screensRow, aiUsageRow] = await Promise.all([
      pool.query(
        `SELECT plan, status FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
        [code]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM client_screens WHERE client_code = $1`,
        [code]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM ai_generation_log
         WHERE client_code = $1 AND created_at >= date_trunc('month', NOW())`,
        [code]
      ).catch(() => ({ rows: [{ count: 0 }] })),
    ])

    const sub = subRow.rows[0]
    const screenCount = screensRow.rows[0]?.count ?? 0
    const aiUsed = aiUsageRow.rows[0]?.count ?? 0

    if (!sub || !(sub.plan in PLANS)) {
      // Sem assinatura ativa (ex: cliente de teste, ou ainda não assinou) —
      // devolve só o uso, sem info de plano.
      return NextResponse.json({
        hasPlan: false, screenCount,
        aiGenerations: { used: aiUsed, limit: DEFAULT_AI_GENERATION_LIMIT },
      })
    }

    const plan = PLANS[sub.plan as PlanKey]
    const aiLimit = PLAN_AI_GENERATION_LIMITS[sub.plan as PlanKey]
    return NextResponse.json({
      hasPlan: true,
      planKey: sub.plan,
      planName: plan.name,
      maxScreens: plan.maxScreens,
      subscriptionStatus: sub.status,
      screenCount,
      overLimit: screenCount > plan.maxScreens,
      aiGenerations: { used: aiUsed, limit: aiLimit, unlimited: aiLimit === -1 },
    })
  } catch (err) {
    console.error("[client/plan-usage GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
