// app/api/admin/clients/import/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

// Gera código único tipo BARBE332
function genCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5).padEnd(5, "X")
  const num   = Math.floor(100 + Math.random() * 900)
  return `${clean}${num}`
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"))

  return lines.slice(1).map(line => {
    // suporta vírgula dentro de aspas
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = "" }
      else { current += char }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim() })
    return row
  })
}

// GET — preview sem salvar
export async function GET(req: NextRequest) {
  const url  = new URL(req.url)
  const data = url.searchParams.get("data")
  if (!data) return NextResponse.json({ error: "Sem dados" }, { status: 400 })

  const rows   = parseCsv(decodeURIComponent(data))
  const preview = rows.map((row, i) => {
    const errors: string[] = []
    if (!row.name?.trim())   errors.push("nome obrigatório")
    if (!row.city?.trim())   errors.push("cidade obrigatória")
    if (!row.phone?.trim())  errors.push("telefone obrigatório")
    return { line: i + 2, ...row, valid: errors.length === 0, errors }
  })

  return NextResponse.json({ preview, total: preview.length, valid: preview.filter(r => r.valid).length })
}

// POST — importa de fato
export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { rows: csvRows } = await req.json()
    if (!Array.isArray(csvRows) || csvRows.length === 0) {
      return NextResponse.json({ error: "Nenhuma linha para importar" }, { status: 400 })
    }

    const results: { line: number; name: string; code?: string; status: "ok" | "error"; error?: string }[] = []

    for (const row of csvRows) {
      if (!row.valid) {
        results.push({ line: row.line, name: row.name || "—", status: "error", error: row.errors.join(", ") })
        continue
      }

      try {
        // Gera código único — tenta até 3 vezes em caso de colisão
        let code = ""
        for (let attempt = 0; attempt < 3; attempt++) {
          code = genCode(row.name)
          const exists = await pool.query("SELECT 1 FROM studio_clients WHERE code = $1", [code])
          if (exists.rowCount === 0) break
        }

        const phone = normalizePhone(row.phone || "")

        // Achado em produção (16/07/2026): esta rota tentava gravar numa
        // coluna "plan" que não existe em studio_clients — o plano é
        // rastreado só em financial_subscriptions, criada separadamente
        // (fluxo de "Assinatura"). Isso quebrava TODO cadastro, tanto via
        // CSV quanto pelo botão "+ Novo Cliente" (que reaproveita esta
        // mesma rota) — nunca tinha sido testado com dado real antes.
        await pool.query(
          `INSERT INTO studio_clients
            (code, name, business_type, address, city, phone, email, active, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW())
           ON CONFLICT (code) DO NOTHING`,
          [
            code,
            row.name.trim(),
            row.business_type?.trim() || null,
            row.address?.trim()       || null,
            row.city.trim(),
            phone                     || null,
            row.email?.trim()         || null,
          ]
        )

        results.push({ line: row.line, name: row.name, code, status: "ok" })
      } catch (err: any) {
        results.push({ line: row.line, name: row.name, status: "error", error: err.message })
      }
    }

    const ok    = results.filter(r => r.status === "ok").length
    const error = results.filter(r => r.status === "error").length

    return NextResponse.json({ results, summary: { ok, error, total: results.length } })
  } catch (err) {
    console.error("[csv-import]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
