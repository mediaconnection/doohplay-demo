// app/api/client/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = "dooh-media"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getPool()
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Código do cliente é obrigatório" }, { status: 400 })
    }

    // FIX (12/07/2026 — nível médio da varredura de segurança): antes só
    // checava que a mídia pertencia ao code informado — code sozinho não é
    // segredo, então qualquer um sabendo o code de um cliente conseguia
    // apagar as mídias dele. Agora exige sessão.
    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Confirma que a mídia pertence a uma campanha do cliente (segurança)
    // e já traz a URL — precisa dela pra apagar o arquivo real do R2.
    const { rows: check } = await pool.query(`
      SELECT cm.id, cm.url FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      WHERE cm.id = $1 AND c."advertiserCode" = $2
    `, [id, code.toUpperCase()])

    if (!check[0]) {
      return NextResponse.json({ error: "Mídia não encontrada ou não pertence a este cliente" }, { status: 404 })
    }

    // Remove agendamento de playlist (se existir)
    await pool.query(`DELETE FROM playlist_schedule WHERE media_id = $1 AND client_code = $2`, [id, code.toUpperCase()])

    // Remove a mídia do banco
    await pool.query(`DELETE FROM "CampaignMedia" WHERE id = $1`, [id])

    // Remove o arquivo real do R2 — antes só apagava do banco, deixando um
    // arquivo órfão que continuava contando pro limite de mídia do plano
    // (que é checado direto no bucket). Best-effort: se o R2 falhar, o
    // registro já foi removido do banco de qualquer forma; loga e segue.
    try {
      const url: string = check[0].url
      const key = url.split(`${BUCKET}/`).pop() || url.split("/r2.dev/").pop()
      if (key) {
        await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
      }
    } catch (r2Err) {
      console.error("[media DELETE] falha ao remover do R2 (registro já removido do banco):", r2Err)
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error("[media DELETE]", err)
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 })
  }
}
