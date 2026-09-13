// lib/screens/offlineAlertCheck.ts
// Alerta proativo de tela offline via WhatsApp (2026-09-13) — ver
// STATUS_PROJETO.md, "Investigação — Alerta proativo de tela offline via
// WhatsApp". Motivado por gap real contra concorrente (SigX) e pelo
// incidente real de BARBE332/LEMEL186 offline sem ninguém notar a tempo.
//
// Destinatário: só o fundador (decisão do fundador, 2026-09-13) — não o
// dono do estabelecimento. DOOHPLAY_PHONE é o mesmo número interno já
// usado em app/api/onboarding/route.ts.
//
// Threshold configurável por cliente (studio_clients.offline_alert_threshold_min,
// default 45min) — calibrado pro padrão real de queda curta/frequente do
// BARBE332 (30min ainda pegaria flutuação normal de rede).
//
// Anti-repetição: uma linha "aberta" (recovered_at IS NULL) por incidente
// em screen_offline_incidents. Só reenvia o alerta de queda depois de 6h
// contínuas sem aviso novo. Quando o player volta a pingar dentro do
// threshold, fecha o incidente e manda o aviso de "voltou ao ar".
import { getPool } from "@/lib/db"
import { sendWhatsApp } from "@/lib/whatsapp"

// lib/whatsapp.ts::sendWhatsApp já prefixa "55" sozinho -- por isso o
// DOOHPLAY_PHONE (que já vem com "55" no valor histórico de onboarding)
// precisa ter esse prefixo removido antes de passar pra cá, senão dobra.
const DOOHPLAY_PHONE_RAW = process.env.DOOHPLAY_PHONE || "5511962050987"
const DOOHPLAY_PHONE_DIGITS = DOOHPLAY_PHONE_RAW.replace(/^55/, "")

const REALERT_AFTER_MS = 6 * 60 * 60 * 1000 // 6h

interface OfflinePlayerRow {
  player_id: string
  client_code: string
  client_name: string
  threshold_min: number
  last_ping: string
}

interface RecoveredPlayerRow {
  incident_id: number
  client_code: string
  client_name: string
}

export interface OfflineAlertCheckResult {
  alerted: { client_code: string; client_name: string }[]
  recovered: { client_code: string; client_name: string }[]
  skipped_anti_repeat: { client_code: string; client_name: string }[]
  errors: { client_code: string; message: string }[]
}

function offlineMessage(clientName: string, clientCode: string, thresholdMin: number): string {
  return `⚠️ *Alerta DOOHPLAY* — a tela de *${clientName}* (${clientCode}) está sem conexão há mais de ${thresholdMin} minutos.`
}

function recoveredMessage(clientName: string, clientCode: string): string {
  return `✅ *DOOHPLAY* — a tela de *${clientName}* (${clientCode}) voltou a enviar sinal.`
}

/**
 * dryRun: quando true, não escreve no banco nem envia WhatsApp — só
 * reporta o que faria. Uso: testar a lógica contra dado real de produção
 * sem efeito colateral, antes de ativar o envio de verdade.
 */
export async function runScreenOfflineAlertCheck(dryRun = false): Promise<OfflineAlertCheckResult> {
  const pool = getPool()
  const result: OfflineAlertCheckResult = { alerted: [], recovered: [], skipped_anti_repeat: [], errors: [] }

  const { rows: offlinePlayers } = await pool.query<OfflinePlayerRow>(`
    SELECT
      p.id::text AS player_id,
      sc.code AS client_code,
      sc.name AS client_name,
      sc.offline_alert_threshold_min AS threshold_min,
      p.last_ping::text AS last_ping
    FROM players p
    JOIN studio_clients sc ON sc.player_id = p.id
    WHERE sc.active = true
      AND p.last_ping IS NOT NULL
      AND NOW() - p.last_ping > (sc.offline_alert_threshold_min || ' minutes')::interval
  `)

  for (const player of offlinePlayers) {
    try {
      const { rows: openIncident } = await pool.query<{ id: number; last_alerted_at: string }>(
        `SELECT id, last_alerted_at::text FROM screen_offline_incidents WHERE player_id = $1::uuid AND recovered_at IS NULL ORDER BY started_at DESC LIMIT 1`,
        [player.player_id]
      )

      if (openIncident.length === 0) {
        result.alerted.push({ client_code: player.client_code, client_name: player.client_name })
        if (!dryRun) {
          await pool.query(
            `INSERT INTO screen_offline_incidents (player_id, client_code) VALUES ($1::uuid, $2)`,
            [player.player_id, player.client_code]
          )
          await sendWhatsApp(DOOHPLAY_PHONE_DIGITS, offlineMessage(player.client_name, player.client_code, player.threshold_min))
        }
        continue
      }

      const lastAlertedMs = new Date(openIncident[0].last_alerted_at).getTime()
      if (Date.now() - lastAlertedMs > REALERT_AFTER_MS) {
        result.alerted.push({ client_code: player.client_code, client_name: player.client_name })
        if (!dryRun) {
          await pool.query(`UPDATE screen_offline_incidents SET last_alerted_at = NOW() WHERE id = $1`, [openIncident[0].id])
          await sendWhatsApp(DOOHPLAY_PHONE_DIGITS, offlineMessage(player.client_name, player.client_code, player.threshold_min))
        }
      } else {
        result.skipped_anti_repeat.push({ client_code: player.client_code, client_name: player.client_name })
      }
    } catch (err: any) {
      console.error(`[offline-alert] erro pra ${player.client_code}:`, err)
      result.errors.push({ client_code: player.client_code, message: err.message })
    }
  }

  const { rows: recoveredPlayers } = await pool.query<RecoveredPlayerRow>(`
    SELECT
      soi.id AS incident_id,
      sc.code AS client_code,
      sc.name AS client_name
    FROM screen_offline_incidents soi
    JOIN players p ON p.id = soi.player_id
    JOIN studio_clients sc ON sc.player_id = p.id
    WHERE soi.recovered_at IS NULL
      AND p.last_ping IS NOT NULL
      AND NOW() - p.last_ping <= (sc.offline_alert_threshold_min || ' minutes')::interval
  `)

  for (const player of recoveredPlayers) {
    try {
      result.recovered.push({ client_code: player.client_code, client_name: player.client_name })
      if (!dryRun) {
        await pool.query(`UPDATE screen_offline_incidents SET recovered_at = NOW() WHERE id = $1`, [player.incident_id])
        await sendWhatsApp(DOOHPLAY_PHONE_DIGITS, recoveredMessage(player.client_name, player.client_code))
      }
    } catch (err: any) {
      console.error(`[offline-alert] erro de recovery pra ${player.client_code}:`, err)
      result.errors.push({ client_code: player.client_code, message: err.message })
    }
  }

  return result
}
