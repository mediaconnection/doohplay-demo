import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// ── Limites por plano ─────────────────────────────────────────────────────────
const LIMITS = {
  image: {
    maxSize:  10 * 1024 * 1024,  // 10MB
    maxCount: 20,
    types:    ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext:      (mime: string) => mime.split("/")[1] || "jpg",
  },
  video: {
    maxSize:  100 * 1024 * 1024, // 100MB
    maxCount: 5,
    types:    ["video/mp4", "video/webm", "video/quicktime"],
    ext:      (_mime: string) => "mp4",
  },
}

function getFileCategory(mime: string): "image" | "video" | null {
  if (LIMITS.image.types.includes(mime)) return "image"
  if (LIMITS.video.types.includes(mime)) return "video"
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file     = formData.get("file") as File | null
    const code     = (formData.get("code") as string)?.trim().toUpperCase()

    if (!file || !code) {
      return NextResponse.json({ error: "file e code obrigatórios" }, { status: 400 })
    }

    // ── Valida cliente ────────────────────────────────────────────────────────
    const pool = getPool()
    const clientRes = await pool.query(
      `SELECT id, name FROM studio_clients WHERE code = $1 AND active = true LIMIT 1`,
      [code]
    )
    if (!clientRes.rows[0]) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // ── Valida tipo de arquivo ────────────────────────────────────────────────
    const category = getFileCategory(file.type)
    if (!category) {
      return NextResponse.json({
        error: "Formato inválido. Aceitos: JPG, PNG, WebP, GIF (imagens) · MP4, WebM, MOV (vídeos)",
      }, { status: 400 })
    }

    const limit = LIMITS[category]

    // ── Valida tamanho ────────────────────────────────────────────────────────
    if (file.size > limit.maxSize) {
      const maxMB = limit.maxSize / 1024 / 1024
      return NextResponse.json({
        error: `Arquivo muito grande. Máximo ${maxMB}MB para ${category === "image" ? "imagens" : "vídeos"}.`,
      }, { status: 400 })
    }

    // ── Valida quantidade no storage ─────────────────────────────────────────
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const prefix = `studio/${code}/`
    const { data: existingFiles } = await supabase.storage
      .from("dooh-media")
      .list(prefix, { limit: 100 })

    if (existingFiles) {
      const categoryFiles = existingFiles.filter(f => {
        const name = f.name.toLowerCase()
        if (category === "image") return /\.(jpg|jpeg|png|webp|gif)$/i.test(name)
        if (category === "video") return /\.(mp4|webm|mov|quicktime)$/i.test(name)
        return false
      })

      if (categoryFiles.length >= limit.maxCount) {
        return NextResponse.json({
          error: `Limite de ${limit.maxCount} ${category === "image" ? "imagens" : "vídeos"} atingido. Remova arquivos antigos antes de fazer novo upload.`,
          current: categoryFiles.length,
          max: limit.maxCount,
        }, { status: 400 })
      }
    }

    // ── Upload para Supabase Storage ─────────────────────────────────────────
    const ext      = limit.ext(file.type)
    const fileName = `studio/${code}/${category}_${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from("dooh-media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("[studio/upload] Supabase error:", error)
      return NextResponse.json({ error: "Erro no upload: " + error.message }, { status: 500 })
    }

    // ── URL pública ───────────────────────────────────────────────────────────
    const { data: urlData } = supabase.storage
      .from("dooh-media")
      .getPublicUrl(fileName)

    return NextResponse.json({
      ok:       true,
      url:      urlData.publicUrl,
      path:     fileName,
      category,
      size_mb:  +(file.size / 1024 / 1024).toFixed(2),
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[studio/upload] error:", message)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// ── GET — lista arquivos do cliente ──────────────────────────────────────────
// GET /api/studio/upload?code=ZIMERM
export async function GET(request: NextRequest) {
  try {
    const code = new URL(request.url).searchParams.get("code")?.toUpperCase()
    if (!code) return NextResponse.json({ error: "code obrigatório" }, { status: 400 })

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: files, error } = await supabase.storage
      .from("dooh-media")
      .list(`studio/${code}/`, { limit: 100 })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const images = (files || []).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
    const videos = (files || []).filter(f => /\.(mp4|webm|mov)$/i.test(f.name))

    return NextResponse.json({
      images: { count: images.length, max: LIMITS.image.maxCount },
      videos: { count: videos.length, max: LIMITS.video.maxCount },
      files:  files || [],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
