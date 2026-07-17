// app/api/admin/clients/[code]/route.ts
//
// Exclusão de cliente (studio_clients) pelo admin. Remove em cascata só as
// tabelas que já confirmamos com certeza nesta sessão (mídia, playlist,
// Clube de Telas, leads, alertas, assinaturas). NÃO toca no módulo de
// trust score (`players` e suas 8 tabelas dependentes) — só desvincula o
// player_id, deixando o registro órfão lá, porque não temos certeza total
// do esquema completo dessas tabelas e prefiro não arriscar mais uma perda
// de dados sem explicação (já tivemos uma nesta sessão).
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// PATCH — edita dados de cadastro do cliente (nome, tipo, endereço, cidade,
// telefone, email, CPF/CNPJ). Não existia nenhuma forma de editar esses
// campos depois do cadastro — só o multiplicador de preço (rota /api/clients/[code]/pricing).
export async function PATCH(req: NextRequest, context: any) {
  if (!(await checkAuth(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { code } = await context.params
  const upperCode = String(code).toUpperCase()
  const body = await req.json()

  const allowed = ["name", "business_type", "address", "city", "phone", "email", "cpf_cnpj"] as const
  const updates: string[] = []
  const values: any[] = []
  let i = 1
  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates.push(`${field} = $${i}`)
      values.push(body[field] || null)
      i++
    }
  }
  if (updates.length === 0) {
    return Response.json({ error: "Nenhum campo pra atualizar" }, { status: 400 })
  }
  values.push(upperCode)

  const pool = getPool()
  try {
    const result = await pool.query(
      `UPDATE studio_clients SET ${updates.join(", ")} WHERE code = $${i} RETURNING code, name`,
      values
    )
    if (!result.rows[0]) return Response.json({ error: "Cliente não encontrado" }, { status: 404 })
    return Response.json({ ok: true, ...result.rows[0] })
  } catch (err: any) {
    console.error("[admin clients PATCH]", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const session = await getServerSession()
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")

  const isNextAuth = !!session?.user
  const isLegacy   = secret && secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { code } = await context.params
  const upperCode = String(code).toUpperCase()
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Campanhas/mídia do dono (campanha sombra "Promoções da Loja")
    await client.query(
      `DELETE FROM "CampaignMedia" WHERE "campaignId" IN (SELECT id FROM "Campaign" WHERE "advertiserCode" = $1)`,
      [upperCode]
    )
    await client.query(`DELETE FROM "Campaign" WHERE "advertiserCode" = $1`, [upperCode])

    // Vínculos de anúncio de terceiro NESTA tela (não apaga a campanha do
    // anunciante, só o vínculo com essa tela que está sendo excluída)
    await client.query(`DELETE FROM "CampaignScreen" WHERE "screenId" = $1`, [upperCode])

    // Playlist e programação
    await client.query(`DELETE FROM playlist_schedule WHERE client_code = $1`, [upperCode])

    // Clube de Telas
    await client.query(
      `DELETE FROM network_media_distribution WHERE displayed_on_code = $1
         OR network_media_id IN (SELECT id FROM network_media WHERE owner_code = $1)`,
      [upperCode]
    )
    await client.query(`DELETE FROM network_media WHERE owner_code = $1`, [upperCode])
    await client.query(
      `DELETE FROM network_partnerships WHERE requester_code = $1 OR partner_code = $1`,
      [upperCode]
    )
    await client.query(`DELETE FROM client_locations WHERE client_code = $1`, [upperCode]).catch(() => {})

    // Leads capturados via QR
    await client.query(`DELETE FROM client_leads WHERE client_code = $1`, [upperCode]).catch(() => {})

    // Alertas de cadastro duplicado envolvendo este código
    await client.query(`DELETE FROM duplicate_signup_alerts WHERE studio_client_code = $1`, [upperCode]).catch(() => {})

    // Assinatura/financeiro
    await client.query(`DELETE FROM financial_subscriptions WHERE code = $1`, [upperCode]).catch(() => {})

    // Desvincula o player (não deleta — módulo de trust score fica intacto)
    await client.query(`UPDATE studio_clients SET player_id = NULL WHERE code = $1`, [upperCode])

    // Por fim, o cliente
    const result = await client.query(`DELETE FROM studio_clients WHERE code = $1 RETURNING code`, [upperCode])

    await client.query("COMMIT")

    if (!result.rows[0]) {
      return Response.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    return Response.json({ ok: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("[admin clients DELETE]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  } finally {
    client.release()
  }
}
