// app/api/admin/media-examples/[id]/route.ts
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const pool = getPool()
  try {
    const { active } = await req.json()
    const { rows } = await pool.query(
      `UPDATE media_examples SET active = $1 WHERE id = $2 RETURNING id, active`,
      [!!active, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Exemplo não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err: any) {
    console.error("[admin/media-examples/[id] PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — exclusão de verdade (achado em produção, 16/07/2026: essa tela só
// tinha PATCH pra ativar/desativar, nunca existiu exclusão real — item
// desativado ficava pra sempre ocupando espaço no banco e no R2). Apaga o
// registro em media_examples E o arquivo real no bucket, pra não acumular
// lixo no R2 silenciosamente.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT url FROM media_examples WHERE id = $1`,
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Exemplo não encontrado" }, { status: 404 })

    // Apaga o arquivo no R2 — melhor esforço: se a chave não bater com o
    // padrão esperado ou o objeto já não existir, não impede a exclusão do
    // registro (log e segue, pra não deixar lixo órfão travando a exclusão).
    const url: string = rows[0].url
    if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
      const key = url.slice(PUBLIC_URL.length).replace(/^\//, "")
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
      } catch (r2err) {
        console.error("[admin/media-examples/[id] DELETE] falha ao apagar do R2 (seguindo mesmo assim):", r2err)
      }
    }

    await pool.query(`DELETE FROM media_examples WHERE id = $1`, [id])
    return NextResponse.json({ ok: true, deleted: id })
  } catch (err: any) {
    console.error("[admin/media-examples/[id] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
