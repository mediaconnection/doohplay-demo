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
        "apikey": process.env.EVOLUTION_API_KEY ?? "",
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

    // Validação no CADASTRO, não só na hora da cobrança — esses 3 campos
    // (email, CPF/CNPJ, cidade) são exigidos pelo Asaas pra gerar cobrança
    // de campanha real (ver app/api/advertiser/[code]/campaigns/route.ts).
    // Descobrir isso só na cobrança custou bastante tempo de debug numa
    // sessão anterior — validar aqui evita o mesmo problema de novo.
    const missing: string[] = []
    if (!name) missing.push("nome")
    if (!phone) missing.push("telefone")
    if (!email) missing.push("email")
    if (!cnpj) missing.push("CPF/CNPJ")
    if (!city) missing.push("cidade")
    if (missing.length > 0) {
      return Response.json(
        { error: `Campos obrigatórios faltando: ${missing.join(", ")}.` },
        { status: 400 }
      )
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

    // Cria anunciante — agora salvando cpfCnpj/city/segment, que antes
    // eram coletados no formulário mas nunca chegavam a ser persistidos.
    await pool.query(
      `INSERT INTO "Advertiser" (id, code, name, email, phone, "cpfCnpj", city, segment, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW())`,
      [code, name, email, phone.replace(/\D/g, ""), cnpj.replace(/\D/g, ""), city, segment ?? null]
    )

    // Detecta possível cadastro duplicado: mesmo telefone já existe como
    // dono de tela (studio_clients). Não bloqueia o cadastro, só alerta —
    // já aconteceu de um cliente real usar o portal errado e fazer upload
    // de todo o conteúdo da própria tela como se fosse anúncio de terceiro.
    try {
      const cleanPhone = phone.replace(/\D/g, "")
      const dupClient = await pool.query(
        `SELECT code FROM studio_clients WHERE phone = $1 LIMIT 1`,
        [cleanPhone]
      )
      if (dupClient.rows[0]) {
        await pool.query(
          `INSERT INTO duplicate_signup_alerts (phone, studio_client_code, advertiser_code)
           VALUES ($1, $2, $3)`,
          [cleanPhone, dupClient.rows[0].code, code]
        )
        console.warn(`[advertiser/register] Possível cadastro duplicado: telefone ${cleanPhone} já é dono de tela (${dupClient.rows[0].code}), agora também anunciante (${code})`)
      }
    } catch (dupErr) {
      console.error("[advertiser/register] Erro ao checar duplicidade:", dupErr)
    }

    // Envia WhatsApp de boas-vindas
    await sendWhatsApp(phone, name.split(" ")[0], code)

    return Response.json({ ok: true, code, link: `https://doohplay.com.br/anunciante/${code}` }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
