import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

function voterHash(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const ua = req.headers.get("user-agent") || "unknown"
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex")
}

// GET — resultado atual da enquete (contagem por opção)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getPool()
  try {
    const poll = await pool.query(
      `SELECT id, question, options, active FROM polls WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (!poll.rows[0]) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 })

    const votes = await pool.query(
      `SELECT option_index, COUNT(*)::int AS count FROM poll_votes WHERE poll_id = $1 GROUP BY option_index`,
      [id]
    )
    const counts = (poll.rows[0].options as string[]).map((_, i) => {
      const row = votes.rows.find((v: any) => v.option_index === i)
      return row ? row.count : 0
    })
    const total = counts.reduce((a: number, b: number) => a + b, 0)

    return NextResponse.json({
      question: poll.rows[0].question,
      options: poll.rows[0].options,
      active: poll.rows[0].active,
      counts,
      total,
    })
  } catch (err: any) {
    console.error("[polls/[id] GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — registra um voto. Fricção básica anti-duplicado (1 voto por
// IP+aparelho a cada 5 minutos) — suficiente pra uma enquete de vitrine,
// não precisa de robustez de votação oficial.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getPool()
  try {
    const { option_index } = await req.json()
    if (typeof option_index !== "number") {
      return NextResponse.json({ error: "option_index é obrigatório" }, { status: 400 })
    }

    const poll = await pool.query(`SELECT options, active FROM polls WHERE id = $1 LIMIT 1`, [id])
    if (!poll.rows[0]) return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 })
    if (!poll.rows[0].active) return NextResponse.json({ error: "Essa enquete não está mais ativa" }, { status: 400 })
    if (option_index < 0 || option_index >= poll.rows[0].options.length) {
      return NextResponse.json({ error: "Opção inválida" }, { status: 400 })
    }

    const hash = voterHash(req)
    const recent = await pool.query(
      `SELECT id FROM poll_votes
       WHERE poll_id = $1 AND voter_hash = $2 AND created_at > NOW() - INTERVAL '5 minutes'
       LIMIT 1`,
      [id, hash]
    )
    if (recent.rows[0]) {
      return NextResponse.json({ error: "Você já votou nessa enquete recentemente" }, { status: 429 })
    }

    await pool.query(
      `INSERT INTO poll_votes (poll_id, option_index, voter_hash) VALUES ($1, $2, $3)`,
      [id, option_index, hash]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[polls/[id] POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
