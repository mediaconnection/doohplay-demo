import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function generateCode(name: string): string {
  const clean = name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X")
  const num = String(Math.floor(Math.random() * 900) + 100)
  return `ADV${clean}${num}`
}

async function sendWhatsApp(phone: string, name: string, code: string) {
  const link = `https://doohplay.com.br/anunciante/${code}`
  const message = `Olá ${name}! 🎉\n\nSeu cadastro no *DOOHPLAY* foi aprovado!\n\nAcesse seu portal de anunciante:\n${link}\n\nSeu código de acesso: *${code}*\n\nQualquer dúvida é só responder aqui. Boas campanhas! 🚀`

  try {
    await fetch("https://evo.doohplay.com.br/message/sendText/doohplay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "q8nC1RGZczvlT7T5figPsLUJTsnsXjtI",
      },
      body: JSON.stringify({
        number: phone.replace(/\D/g, ""),
        text: message,
      }),
    })
  } catch (err) {
    console.error("[register] WhatsApp error:", err)
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()

  try {
    const body = await req.json()
    const { name, email, phone, cnpj, city, segment } = body

    if (!name || !phone) {
      return Response.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 })
    }

    // Gera código único
    let code = generateCode(name)
    let attempts = 0
    while (attempts < 10) {
      const existing = await pool.query(`SELECT id FROM "Advertiser" WHERE code = $1`, [code])
      if (existing.rows.length === 0) break
      code = generateCode(name)
      attempts++
    }

    // Cria anunciante
    await pool.query(
      `INSERT INTO "Advertiser" (id, code, name, email, phone, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
      [code, name, email ?? null, phone.replace(/\D/g, "")]
    )

    // Envia WhatsApp de boas-vindas
    await sendWhatsApp(phone, name.split(" ")[0], code)

    return Response.json({ ok: true, code, link: `https://doohplay.com.br/anunciante/${code}` }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
