// app/api/admin/advertisers/[code]/route.ts
//
// Exclusão de anunciante pelo admin — EXCLUSÃO LÓGICA desde 11/10/2026.
//
// Histórico: a versão de 17/07/2026 apagava em cascata Campaign →
// CampaignMedia → Advertiser e também cada arquivo no R2. Como todo dono de
// tela ganha um "Advertiser" com o próprio código ao enviar mídia
// (ensureCampaign), excluir esse "anunciante" pela aba Anunciantes apagava
// o conteúdo do dono e os arquivos dele, deixando a playlist
// (creative_assets_v2/placements_v2) apontando pra arquivos inexistentes.
// É a causa mais provável dos 404 do LEMEL186 (Documento-Mestre 12.62/12.63).
//
// Agora:
//  - só admin logado (sessão NextAuth assinada; sem ?secret=);
//  - código que pertence a um dono de tela (studio_clients) é recusado (409);
//  - marca "Advertiser".deleted_at e encerra as campanhas (status
//    'deleted', que a playlist não serve — ela exige status = 'active');
//  - NÃO apaga linha de mídia/campanha e NÃO toca no R2.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { requireAdminSession } from "../../_lib/requireAdmin"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const auth = await requireAdminSession("admin/advertisers DELETE")
  if (auth.denied) return auth.denied

  const { code: rawCode } = await params
  const code = rawCode?.toUpperCase()
  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const adv = await pool.query(
      `SELECT id, code, name FROM "Advertiser" WHERE UPPER(code) = $1 AND deleted_at IS NULL LIMIT 1`,
      [code]
    )
    if (!adv.rows[0]) return NextResponse.json({ error: "Anunciante não encontrado" }, { status: 404 })

    // O conteúdo do dono vive numa Campaign com advertiserCode = código do
    // dono. Excluir esse "anunciante" tiraria o conteúdo dele do ar.
    const owner = await pool.query(
      `SELECT 1 FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [code]
    )
    if (owner.rows[0]) {
      console.warn(`[admin/advertisers DELETE] 409 ${code} é dono de tela (pedido por ${auth.email})`)
      return NextResponse.json(
        { error: `${code} é o código de um dono de tela. Este registro guarda o conteúdo próprio dele e não pode ser excluído por aqui.` },
        { status: 409 }
      )
    }

    const client = await pool.connect()
    let campaigns = 0
    try {
      await client.query("BEGIN")
      await client.query(
        `UPDATE "Advertiser" SET deleted_at = NOW() WHERE UPPER(code) = $1 AND deleted_at IS NULL`,
        [code]
      )
      const res = await client.query(
        `UPDATE "Campaign" SET status = 'deleted', "updatedAt" = NOW()
         WHERE UPPER("advertiserCode") = $1 AND status <> 'deleted'`,
        [code]
      )
      campaigns = res.rowCount ?? 0
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }

    console.log(`[admin/advertisers DELETE] ${code} marcado como excluído por ${auth.email}; ${campaigns} campanha(s) encerrada(s); nenhum arquivo apagado`)
    return NextResponse.json({ ok: true, deleted: code, campaigns_closed: campaigns, soft: true })
  } catch (err: any) {
    console.error("[admin/advertisers/[code] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
