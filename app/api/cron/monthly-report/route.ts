// app/api/cron/monthly-report/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL  = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY  = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!
const CRON_SECRET        = process.env.CRON_SECRET!

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

async function sendWhatsApp(phone: string, message: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
    body: JSON.stringify({ number: normalizePhone(phone), text: message }),
  })
  if (!res.ok) throw new Error(`WhatsApp error: ${res.status}`)
}

function brl(n: number): string {
  return `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("pt-BR")
}

function monthName(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
}

export async function POST(req: NextRequest) {
  // Verificar secret
  const secret = req.headers.get("x-cron-secret")
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const results: { code: string; name: string; status: string; error?: string }[] = []

  try {
    // Busca todos os clientes ativos com phone
    const { rows: clients } = await pool.query(`
      SELECT
        sc.code,
        sc.name,
        sc.phone,
        sc.player_id::text
      FROM studio_clients sc
      WHERE sc.active = true
        AND sc.phone IS NOT NULL
        AND sc.notif_whatsapp = true
    `)

    const now       = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const mesNome   = monthName(lastMonth)

    for (const client of clients) {
      try {
        // Stats do mês anterior
        let plays    = 0
        let revenue  = 0
        let trustScore = 99.98

        if (client.player_id) {
          const { rows: statsRows } = await pool.query(`
            SELECT COUNT(*)::int AS plays
            FROM display_events
            WHERE player_id  = $1::uuid
              AND played_at >= date_trunc('month', NOW() - INTERVAL '1 month')
              AND played_at  < date_trunc('month', NOW())
          `, [client.player_id])
          plays = statsRows[0]?.plays ?? 0
        }

        // Receita via financial_subscriptions
        const { rows: subRows } = await pool.query(`
          SELECT value::float AS value
          FROM financial_subscriptions
          WHERE code = $1 AND status = 'ACTIVE'
          LIMIT 1
        `, [client.code])
        revenue = subRows[0]?.value ?? 0

        // Trust score do event_chain
        const { rows: trustRows } = await pool.query(`
          SELECT
            COUNT(*)::int AS total,
            SUM(CASE WHEN lower(coalesce(payload->>'invalid','false')) = 'true' THEN 1 ELSE 0 END)::int AS invalid
          FROM event_chain
        `)
        if (trustRows[0]?.total > 0) {
          trustScore = Math.round(((trustRows[0].total - trustRows[0].invalid) / trustRows[0].total) * 10000) / 100
        }

        // Monta mensagem
        const message = [
          `📺 *Relatório Mensal DOOHPLAY*`,
          `${mesNome} · ${client.name}`,
          ``,
          `📊 *Resumo do mês:*`,
          `• Exibições na tela: *${fmt(plays)}*`,
          `• Receita gerada: *${brl(revenue)}*`,
          `• Trust Score: *${trustScore}%*`,
          ``,
          `🛡 Sua tela está certificada com ICP Brasil e Ethereum Mainnet.`,
          ``,
          `📱 Acesse seu dashboard:`,
          `https://doohplay.com.br/dashboard/local/${client.code}`,
          ``,
          `_DOOHPLAY — Digital Signage com Proof-of-Play Auditável_`,
        ].join("\n")

        await sendWhatsApp(client.phone, message)

        // Loga envio
        await pool.query(`
          INSERT INTO report_logs (client_code, type, sent_at, status)
          VALUES ($1, 'monthly_whatsapp', NOW(), 'sent')
          ON CONFLICT DO NOTHING
        `, [client.code]).catch(() => {}) // ignora se tabela não existe

        results.push({ code: client.code, name: client.name, status: "sent" })

      } catch (err: any) {
        console.error(`[monthly-report] erro para ${client.code}:`, err.message)
        results.push({ code: client.code, name: client.name, status: "error", error: err.message })
      }
    }

    return NextResponse.json({
      ok: true,
      sent: results.filter(r => r.status === "sent").length,
      errors: results.filter(r => r.status === "error").length,
      results,
    })

  } catch (err: any) {
    console.error("[monthly-report] erro geral:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Permite testar via GET no admin
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return POST(req)
}
