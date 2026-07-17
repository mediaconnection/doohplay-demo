// app/api/admin/advertisers/[code]/route.ts
//
// Achado em produção (16/07/2026): não existia NENHUMA forma de excluir um
// anunciante — nem botão na tela, nem rota de API. A aba Anunciantes só
// tinha visualização, sem onRefresh sequer passado como prop. Criado do
// zero, seguindo o mesmo cuidado já usado em /api/admin/media-examples/[id]
// (Fase 26/16-07): apaga em cascata (mídia de campanha → campanha →
// anunciante) e tenta limpar os arquivos reais no R2, melhor esforço —
// nunca deixa lixo travando a exclusão se o R2 falhar.
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
const BUCKET     = "dooh-media"
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ""

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

async function deleteFromR2(url: string) {
  if (!PUBLIC_URL || !url?.startsWith(PUBLIC_URL)) return
  const key = url.slice(PUBLIC_URL.length).replace(/^\//, "")
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (err) {
    console.error("[admin/advertisers DELETE] falha ao apagar do R2 (seguindo mesmo assim):", key, err)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { code: rawCode } = await params
  const code = rawCode?.toUpperCase()
  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const adv = await pool.query(
      `SELECT id, code, name FROM "Advertiser" WHERE UPPER(code) = $1 LIMIT 1`,
      [code]
    )
    if (!adv.rows[0]) return NextResponse.json({ error: "Anunciante não encontrado" }, { status: 404 })

    // Campanhas desse anunciante (pra cascatear mídia/telas antes de apagar)
    const campaigns = await pool.query(
      `SELECT id FROM "Campaign" WHERE UPPER("advertiserCode") = $1`,
      [code]
    )
    const campaignIds = campaigns.rows.map((r: any) => r.id)

    if (campaignIds.length > 0) {
      // Coleta URLs de mídia pra limpar no R2 antes de apagar as linhas
      const medias = await pool.query(
        `SELECT url FROM "CampaignMedia" WHERE "campaignId" = ANY($1::text[]) AND url IS NOT NULL`,
        [campaignIds]
      )
      await Promise.all(medias.rows.map((m: any) => deleteFromR2(m.url)))

      await pool.query(`DELETE FROM "CampaignScreen" WHERE "campaignId" = ANY($1::text[])`, [campaignIds])
      await pool.query(`DELETE FROM "CampaignMedia" WHERE "campaignId" = ANY($1::text[])`, [campaignIds])
      await pool.query(`DELETE FROM "Campaign" WHERE id = ANY($1::text[])`, [campaignIds])
    }

    // Alertas de duplicidade (telefone cadastrado como dono E anunciante)
    // que referenciam esse anunciante — senão fica um alerta órfão apontando
    // pra um anunciante que não existe mais.
    await pool.query(
      `DELETE FROM duplicate_signup_alerts WHERE UPPER(advertiser_code) = $1`,
      [code]
    ).catch(() => {}) // tolera tabela ainda não migrada, mesmo padrão usado em admin/stats

    await pool.query(`DELETE FROM "Advertiser" WHERE UPPER(code) = $1`, [code])

    return NextResponse.json({
      ok: true,
      deleted: code,
      campaigns_removed: campaignIds.length,
    })
  } catch (err: any) {
    console.error("[admin/advertisers/[code] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
