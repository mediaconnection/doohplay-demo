// app/api/client/assistant/insights/route.ts
// GET ?code=BARBE332 — cards do Assistente IA (aba Insights). Fase 18
// (29/08/2026), porta do protótipo Figma Make AIAssistant.tsx.
//
// Diferente do protótipo (5 cards fixos com número inventado), aqui cada
// card só existe se houver dado real por trás — sem métrica real, o
// insight simplesmente não aparece (nunca inventa número). "Propostas de
// anunciante" e "Meta do mês" do protótipo ficaram de fora: não existe
// hoje nenhuma tabela de propostas nomeadas nem de metas por cliente —
// ver plano de arquitetura discutido antes de implementar.
//
// Mesmo padrão de autenticação de app/api/client/payouts/route.ts —
// sessão da Fase 14, cookie doohplay_client_session, comparado ao code.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { PLANS, PlanKey, PLAN_AI_GENERATION_LIMITS, DEFAULT_AI_GENERATION_LIMIT } from "@/lib/asaas"

export const dynamic = "force-dynamic"

export type Insight = {
  id: string
  title: string
  body: string
  impact: string
  color: "success" | "warning" | "danger" | "info"
  view?: string // id de NAV em dashboard-client.tsx pro botão "Resolver"
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase()
  if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== code) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()
  const insights: Insight[] = []

  try {
    const clientRes = await pool.query(
      `SELECT player_id::text FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code]
    )
    const playerId = clientRes.rows[0]?.player_id ?? null

    const [payoutsRes, subRes, aiUsageRes, playsRes, playerRes] = await Promise.all([
      // 1) Tendência de ganhos: mês atual vs mês anterior
      pool.query(
        `SELECT
           COALESCE(SUM(net_amount) FILTER (WHERE created_at >= date_trunc('month', NOW())), 0) AS this_month,
           COALESCE(SUM(net_amount) FILTER (
             WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
               AND created_at <  date_trunc('month', NOW())
           ), 0) AS last_month
         FROM client_payouts WHERE client_code = $1`,
        [code]
      ).catch(() => ({ rows: [{ this_month: 0, last_month: 0 }] })),

      // 2) Assinatura em atraso
      pool.query(
        `SELECT plan, status FROM financial_subscriptions WHERE code = $1 LIMIT 1`,
        [code]
      ).catch(() => ({ rows: [] as any[] })),

      // 3) Cota de IA (geração de criativo) quase esgotada
      pool.query(
        `SELECT COUNT(*)::int AS count FROM ai_generation_log
         WHERE client_code = $1 AND feature = 'creative' AND created_at >= date_trunc('month', NOW())`,
        [code]
      ).catch(() => ({ rows: [{ count: 0 }] })),

      // 4) Exibições últimos 30 dias — cliente vs média da rede (mesma
      // lógica de app/marketplace/page.tsx, sem extrapolar histórico)
      playerId
        ? pool.query(
            `SELECT
               (SELECT COUNT(*)::int FROM display_events WHERE player_id = $1 AND played_at >= NOW() - INTERVAL '30 days') AS client_plays,
               (SELECT COALESCE(AVG(cnt), 0)::int FROM (
                 SELECT COUNT(*) AS cnt FROM display_events
                 WHERE played_at >= NOW() - INTERVAL '30 days'
                 GROUP BY player_id
               ) sub) AS network_avg`,
            [playerId]
          ).catch(() => ({ rows: [{ client_plays: 0, network_avg: 0 }] }))
        : Promise.resolve({ rows: [{ client_plays: 0, network_avg: 0 }] }),

      // 5) Player sem heartbeat recente
      playerId
        ? pool.query(`SELECT last_ping::text FROM players WHERE id = $1::uuid LIMIT 1`, [playerId])
            .catch(() => ({ rows: [] as any[] }))
        : Promise.resolve({ rows: [] as any[] }),
    ])

    // 1) Ganhos
    const thisMonth = Number(payoutsRes.rows[0]?.this_month ?? 0)
    const lastMonth = Number(payoutsRes.rows[0]?.last_month ?? 0)
    if (lastMonth > 0 && thisMonth < lastMonth) {
      const diff = lastMonth - thisMonth
      const pct = Math.round((diff / lastMonth) * 100)
      insights.push({
        id: "revenue-drop", title: "Ganhos abaixo do mês passado",
        body: `Este mês: R$${thisMonth.toFixed(2)}. Mês passado: R$${lastMonth.toFixed(2)} — ${pct}% a menos até agora.`,
        impact: `-R$${diff.toFixed(2)}`, color: "warning", view: "ganhos",
      })
    } else if (lastMonth > 0 && thisMonth > lastMonth) {
      const diff = thisMonth - lastMonth
      insights.push({
        id: "revenue-up", title: "Ganhos acima do mês passado",
        body: `Este mês: R$${thisMonth.toFixed(2)}, já superando os R$${lastMonth.toFixed(2)} do mês anterior.`,
        impact: `+R$${diff.toFixed(2)}`, color: "success", view: "ganhos",
      })
    }

    // 2) Assinatura
    if (subRes.rows[0]?.status === "OVERDUE") {
      insights.push({
        id: "sub-overdue", title: "Sua assinatura está em atraso",
        body: "O pagamento do seu plano não foi confirmado. Regularize pra evitar interrupção dos serviços.",
        impact: "Ação necessária", color: "danger", view: "config",
      })
    }

    // 3) Cota de IA
    const planKey = subRes.rows[0]?.plan as PlanKey | undefined
    const aiLimit = planKey && planKey in PLAN_AI_GENERATION_LIMITS ? PLAN_AI_GENERATION_LIMITS[planKey] : DEFAULT_AI_GENERATION_LIMIT
    const aiUsed = aiUsageRes.rows[0]?.count ?? 0
    if (aiLimit !== -1 && aiUsed >= aiLimit * 0.8) {
      insights.push({
        id: "ai-quota", title: "Cota de IA quase no limite",
        body: `Você já usou ${aiUsed} de ${aiLimit} gerações de criativo com IA este mês.`,
        impact: aiUsed >= aiLimit ? "Limite atingido" : `${aiLimit - aiUsed} restantes`,
        color: aiUsed >= aiLimit ? "danger" : "warning", view: "config",
      })
    }

    // 4) Exibições vs rede
    const clientPlays = playsRes.rows[0]?.client_plays ?? 0
    const networkAvg = playsRes.rows[0]?.network_avg ?? 0
    if (networkAvg > 0 && clientPlays < networkAvg * 0.6) {
      insights.push({
        id: "low-plays", title: "Exibições abaixo da média da rede",
        body: `Sua tela teve ${clientPlays} exibições nos últimos 30 dias — a média da rede é ${networkAvg}.`,
        impact: `${clientPlays} vs ${networkAvg}`, color: "warning", view: "playlist",
      })
    }

    // 5) Player offline
    const lastPing = playerRes.rows[0]?.last_ping as string | undefined
    const offlineMinutes = lastPing ? (Date.now() - new Date(lastPing).getTime()) / 60000 : null
    if (offlineMinutes === null || offlineMinutes > 15) {
      insights.push({
        id: "player-offline", title: "Sua tela pode estar offline",
        body: lastPing
          ? `Último sinal recebido há ${Math.round(offlineMinutes!)} minutos.`
          : "Nunca recebemos sinal dessa tela.",
        impact: "Verificar conexão", color: "danger", view: "tv",
      })
    }

    return NextResponse.json({ insights })
  } catch (err: any) {
    console.error("[client/assistant/insights GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
