// lib/sla.ts
// Cálculo de SLA diário da rede inteira, últimos N dias — extraído pra cá
// (Fase: fix SLA history, 12/07/2026) pra ser reaproveitado por
// /api/players/sla-history e /api/players/sla-real-history, que antes
// simplesmente não existiam (os componentes do dashboard chamavam rotas
// que nunca foram construídas). Mesma metodologia real de sla-daily.ts:
// conta heartbeats de verdade em event_chain, nunca simula dado.
import { getPool } from "@/lib/db"

const HEARTBEAT_TIMEOUT_SECONDS = 90

type HeartbeatRow = { created_at: string | Date }

function toDate(value: string | Date): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function calculateOnlineSeconds(heartbeats: HeartbeatRow[], rangeEnd: Date): number {
  let onlineSeconds = 0
  for (let index = 0; index < heartbeats.length; index++) {
    const current = toDate(heartbeats[index].created_at)
    if (!current) continue
    const nextRow = heartbeats[index + 1]
    const next = nextRow ? toDate(nextRow.created_at) : null
    const end = next ?? rangeEnd
    const diffSeconds = Math.max(0, (end.getTime() - current.getTime()) / 1000)
    onlineSeconds += Math.min(diffSeconds, HEARTBEAT_TIMEOUT_SECONDS)
  }
  return Math.round(onlineSeconds)
}

export type SlaHistoryPoint = { date: string; sla: number }

// SLA médio da rede (todos os players) por dia, últimos `days` dias
// (incluindo hoje). Retorna do mais antigo pro mais recente, pra plotar
// direto num gráfico de linha sem precisar reordenar no frontend.
export async function computeSlaHistory(days = 7): Promise<SlaHistoryPoint[]> {
  const pool = getPool()

  const playersRes = await pool.query(`SELECT id::text AS id FROM public.players ORDER BY id::text ASC`)
  const players = playersRes.rows as { id: string }[]

  if (players.length === 0) return []

  const points: SlaHistoryPoint[] = []
  const now = new Date()

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    dayStart.setDate(dayStart.getDate() - dayOffset)

    const dayEnd = dayOffset === 0 ? now : new Date(dayStart.getTime() + 86_400_000)
    const totalDaySeconds = Math.max(0, (dayEnd.getTime() - dayStart.getTime()) / 1000)

    let slaSum = 0
    for (const player of players) {
      const heartbeatRes = await pool.query(
        `SELECT created_at FROM public.event_chain
         WHERE source_table = 'players' AND source_id::text = $1 AND event_type = 'PLAYER_HEARTBEAT'
           AND created_at >= $2 AND created_at < $3
         ORDER BY created_at ASC`,
        [player.id, dayStart, dayEnd]
      )
      const onlineSeconds = calculateOnlineSeconds(heartbeatRes.rows as HeartbeatRow[], dayEnd)
      const playerSla = totalDaySeconds > 0 ? (onlineSeconds / totalDaySeconds) * 100 : 0
      slaSum += playerSla
    }

    const networkSla = players.length > 0 ? slaSum / players.length : 0

    points.push({
      date: dayStart.toISOString().slice(0, 10),
      sla: Number(networkSla.toFixed(2)),
    })
  }

  return points
}
