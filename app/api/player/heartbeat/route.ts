// app/api/player/heartbeat/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const body = await req.json()
    // ✅ aceita tanto "code" (APK) quanto "screen_code" (player web)
    const code = body.code ?? body.screen_code
    // ✅ player_id explícito (novo, 30/06/2026) — resolve o bug de
    // identidade com múltiplos aparelhos no mesmo código: antes, o
    // UPDATE sempre ia pro player_id fixo em studio_clients, então com
    // 2+ telas pareadas no mesmo cliente só a última pareada ficava
    // "online" — as outras pareciam offline mesmo enviando heartbeat
    // real. Quando o app manda seu próprio player_id (sabido desde a
    // ativação), atualizamos ele diretamente, sem depender do lookup
    // por código. Mantemos o fallback por code pra apps antigos.
    const playerId = body.player_id

    if (!code && !playerId) {
      return Response.json({ error: "code ou player_id obrigatório" }, { status: 400 })
    }

    const result = playerId
      ? await pool.query(`UPDATE players SET last_ping = NOW() WHERE id = $1 RETURNING id`, [playerId])
      : await pool.query(
          `UPDATE players SET last_ping = NOW()
           WHERE id = (SELECT player_id FROM studio_clients WHERE UPPER(code) = UPPER($1) LIMIT 1)
           RETURNING id`,
          [code]
        )

    // Antes, isso retornava {ok:true} mesmo se nenhuma linha fosse
    // atualizada (player_id nulo, ou players sem registro correspondente)
    // — escondia silenciosamente um cliente sem heartbeat de verdade.
    if (result.rowCount === 0) {
      console.warn(`[heartbeat] nenhuma linha atualizada para code=${code} player_id=${playerId} — identificador ausente ou inválido`)
      return Response.json({ ok: false, warning: "player não encontrado para este identificador" }, { status: 200 })
    }

    // Histórico de uptime diário (30/06/2026) — base pro selo "Tela
    // Verificada". Tabela própria e isolada (player_uptime_daily), não usa
    // player_heartbeats (compartilhada com a frente de prova/blockchain).
    // Falha aqui nunca derruba o heartbeat principal (só loga, não lança).
    const resolvedPlayerId = result.rows[0]?.id
    if (resolvedPlayerId) {
      try {
        await pool.query(
          `INSERT INTO player_uptime_daily (player_id, day, first_seen_at, last_seen_at, ping_count)
           VALUES ($1, CURRENT_DATE, NOW(), NOW(), 1)
           ON CONFLICT (player_id, day) DO UPDATE SET
             last_seen_at = NOW(),
             ping_count = player_uptime_daily.ping_count + 1`,
          [resolvedPlayerId]
        )
      } catch (err: any) {
        console.error("[heartbeat] falha ao registrar uptime diário (não bloqueante):", err.message)
      }
    }

    return Response.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    console.error("[heartbeat]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT id::text, last_ping::text, is_active FROM players WHERE id = $1 LIMIT 1`,
      [id]
    )

    if (!rows[0]) return Response.json({ error: "player não encontrado" }, { status: 404 })

    const { last_ping, is_active } = rows[0]
    const online = last_ping
      ? (Date.now() - new Date(last_ping).getTime()) < 3 * 60 * 1000
      : false

    return Response.json({ ok: true, last_ping, online, is_active })
  } catch (err) {
    console.error("[heartbeat/status]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
