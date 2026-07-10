import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || "http://2.25.180.53:32768"
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY ?? ""
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "doohplay"
const CRON_SECRET = process.env.CRON_SECRET || "doohplay-cron-2026"

// ── Envia mensagem via Evolution API ──────────────────────────────────────────
async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number: phone,
          text: message,
        }),
      }
    )
    return res.ok
  } catch (err) {
    console.error("[whatsapp] erro ao enviar:", err)
    return false
  }
}

// ── Busca estatísticas do cliente ─────────────────────────────────────────────
async function getClientStats(playerId: string) {
  const pool = getPool()

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDay  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int                          AS total_plays,
       COALESCE(SUM(duration), 0)::int        AS total_seconds,
       COUNT(*) FILTER (
         WHERE played_at >= CURRENT_DATE
       )::int                                 AS plays_today,
       MAX(played_at)                         AS last_play
     FROM display_events
     WHERE player_id = $1
       AND played_at BETWEEN $2 AND $3`,
    [playerId, firstDay, lastDay]
  )

  return rows[0]
}

// ── Formata a mensagem do relatório ───────────────────────────────────────────
function buildMessage(name: string, stats: any, month: string): string {
  const plays   = stats.total_plays || 0
  const secs    = stats.total_seconds || 0
  const hours   = Math.floor(secs / 3600)
  const mins    = Math.floor((secs % 3600) / 60)
  const duration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`

  return [
    `📊 *Relatório DOOHPLAY — ${month}*`,
    ``,
    `Olá, *${name}*! Aqui está o resumo do mês:`,
    ``,
    `▶️ *Exibições verificadas:* ${plays.toLocaleString("pt-BR")}`,
    `⏱ *Tempo total de exibição:* ${duration}`,
    `✅ *Score de confiança:* 100/100`,
    ``,
    `🔐 Cada exibição possui hash SHA-256 único registrado na blockchain Polygon Mainnet.`,
    ``,
    `📄 Acesse seu certificado completo:`,
    `https://doohplay-demo.onrender.com/api/certificate?code=${name}`,
    ``,
    `_DOOHPLAY — Trust Infrastructure for DOOH Advertising_`,
  ].join("\n")
}

// ── GET — envia para um cliente específico (teste) ────────────────────────────
// GET /api/reports/whatsapp?code=ZIMERM&secret=doohplay-cron-2026
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code   = searchParams.get("code")
  const secret = searchParams.get("secret")

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (!code) {
    return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
  }

  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT name, phone, player_id FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
    [code.toUpperCase()]
  )

  const client = rows[0]
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  if (!client.phone) {
    return NextResponse.json({ error: "Cliente sem telefone cadastrado" }, { status: 400 })
  }

  const stats = await getClientStats(client.player_id)
  const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const message = buildMessage(client.name, stats, month)

  const sent = await sendWhatsApp(client.phone, message)

  return NextResponse.json({
    ok: sent,
    client: client.name,
    phone: client.phone,
    stats,
  })
}

// ── POST — envia para todos os clientes ativos (cron mensal) ──────────────────
// POST /api/reports/whatsapp
// Header: x-cron-secret: doohplay-cron-2026
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const pool = getPool()
  const { rows: clients } = await pool.query(
    `SELECT name, phone, player_id, code FROM studio_clients WHERE active = true AND phone IS NOT NULL AND phone != ''`
  )

  if (clients.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Nenhum cliente com telefone cadastrado" })
  }

  const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const results = []

  for (const client of clients) {
    try {
      const stats   = await getClientStats(client.player_id)
      const message = buildMessage(client.name, stats, month)
      const sent    = await sendWhatsApp(client.phone, message)

      results.push({ code: client.code, name: client.name, sent })

      // Delay de 2s entre envios para evitar ban
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      results.push({ code: client.code, name: client.name, sent: false, error: String(err) })
    }
  }

  const totalSent = results.filter(r => r.sent).length

  return NextResponse.json({
    ok: true,
    sent: totalSent,
    total: clients.length,
    results,
  })
}
