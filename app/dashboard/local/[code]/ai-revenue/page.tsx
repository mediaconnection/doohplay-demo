export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getPool } from "@/lib/db"
import { estimatedAdvertiserRevenue } from "@/lib/cpmEstimate"
import AIRevenueTabs, { type AIRevenueData } from "./ai-revenue-client"

const DOW_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export default async function AIRevenuePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const pool = getPool()

  let client: any = null
  try {
    const r = await pool.query(
      `SELECT id::text, code, name, business_type, player_id::text FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )
    client = r.rows[0] ?? null
  } catch {}

  if (!client) notFound()

  const playerId: string | null = client.player_id ?? null

  // Fase 46 (30/08/2026): porta o AIRevenueCenter do Figma Make como
  // estrutura de 4 abas (Visão Geral, Oportunidades, Anunciantes
  // Recomendados, Previsão Financeira). Investigação prévia (ver
  // STATUS_PROJETO.md) confirmou que a maioria dos cards do protótipo não
  // tem dado real por trás — sem tabela de metas, sem propostas de
  // anunciante nomeadas, sem fill rate/ocupação calculado em lugar nenhum.
  // As 5 queries abaixo cobrem os únicos itens com dado real disponível
  // hoje; tudo que continua sem dado real vira Simulação, nunca sem o
  // aviso — ver ai-revenue-client.tsx pra como cada bloco é rotulado.
  const [payoutsRes, offlineRes, playsByDowRes, advertisersRes, playerRes] = await Promise.all([
    // 1) Histórico real de repasses (últimos 6 meses com dado)
    pool.query(
      `SELECT date_trunc('month', created_at) AS month, SUM(net_amount)::float AS total
       FROM client_payouts
       WHERE client_code = $1
       GROUP BY 1 ORDER BY 1 DESC LIMIT 6`,
      [code.toUpperCase()]
    ).catch(() => ({ rows: [] as any[] })),

    // 2) Tempo real offline este mês (alertas PLAYER_OFFLINE do próprio
    // motor de alertas do front app/ — leitura simples, não cruza front)
    playerId
      ? pool.query(
          `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))), 0)::float AS offline_seconds
           FROM alerts
           WHERE type = 'PLAYER_OFFLINE' AND source_id = $1
             AND created_at >= date_trunc('month', NOW())`,
          [playerId]
        ).catch(() => ({ rows: [{ offline_seconds: 0 }] }))
      : Promise.resolve({ rows: [{ offline_seconds: 0 }] }),

    // 3) Exibições reais por dia da semana, últimos 30 dias
    playerId
      ? pool.query(
          `SELECT EXTRACT(DOW FROM played_at)::int AS dow, COUNT(*)::int AS plays
           FROM display_events
           WHERE player_id = $1::uuid AND played_at >= NOW() - INTERVAL '30 days'
           GROUP BY 1`,
          [playerId]
        ).catch(() => ({ rows: [] as any[] }))
      : Promise.resolve({ rows: [] as any[] }),

    // 4) Contagem real de anunciantes com campanha ativa na rede
    pool.query(`SELECT COUNT(DISTINCT "advertiserCode")::int AS ativos FROM "Campaign" WHERE status = 'active'`)
      .catch(() => ({ rows: [{ ativos: 0 }] })),

    // 5) Status atual da tela (mesmo padrão de app/api/client/assistant/insights)
    playerId
      ? pool.query(`SELECT last_ping::text FROM players WHERE id = $1::uuid LIMIT 1`, [playerId])
          .catch(() => ({ rows: [] as any[] }))
      : Promise.resolve({ rows: [] as any[] }),
  ])

  const payoutHistory = payoutsRes.rows
    .slice()
    .reverse()
    .map((r: any) => {
      const d = new Date(r.month)
      return { label: `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, total: Number(r.total) || 0 }
    })

  const offlineSeconds = Number(offlineRes.rows[0]?.offline_seconds ?? 0)
  const offlineHours = Math.round((offlineSeconds / 3600) * 10) / 10

  const playsByDow = Array.from({ length: 7 }, (_, dow) => {
    const row = playsByDowRes.rows.find((r: any) => Number(r.dow) === dow)
    return { label: DOW_LABELS[dow], plays: row ? Number(row.plays) : 0 }
  })
  const plays30d = playsByDow.reduce((sum, d) => sum + d.plays, 0)

  const activeAdvertisers = Number(advertisersRes.rows[0]?.ativos ?? 0)

  const lastPing = playerRes.rows[0]?.last_ping as string | undefined
  const offlineMinutesNow = lastPing ? (Date.now() - new Date(lastPing).getTime()) / 60000 : null
  const isOnlineNow = offlineMinutesNow !== null && offlineMinutesNow <= 15

  const data: AIRevenueData = {
    payoutHistory,
    offlineHours,
    playsByDow,
    plays30d,
    activeAdvertisers,
    isOnlineNow,
    hasPlayer: !!playerId,
    estimatedAdvertiserRevenue: estimatedAdvertiserRevenue(plays30d),
  }

  return (
    <AIRevenueTabs
      code={code}
      clientName={client.name}
      businessType={client.business_type}
      data={data}
    />
  )
}
