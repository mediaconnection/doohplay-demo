import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const code = (formData.get("code") as string)?.trim().toUpperCase()

    if (!file || !code) {
      return NextResponse.json({ error: "file e code obrigatórios" }, { status: 400 })
    }

    // Validar cliente
    const clientRes = await pool.query(
      `SELECT id, name FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Validar tipo e tamanho
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem muito grande. Máximo 10MB." }, { status: 400 })
    }

    // Upload para Supabase Storage
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ext = file.type.split("/")[1] || "jpg"
    const fileName = `studio/${code}/${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from("dooh-media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Erro no upload: " + error.message }, { status: 500 })
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from("dooh-media")
      .getPublicUrl(fileName)

    return NextResponse.json({
      ok: true,
      url: urlData.publicUrl,
      path: fileName,
    })
  } catch (err) {
    console.error("Studio upload error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
