// app/api/client/network-media-incoming/[code]/route.ts
//
// Lista a mídia de PARCEIROS que está sendo exibida na tela deste cliente —
// o lado inverso de /api/client/network-media/[code] (que lista a mídia que
// o próprio cliente manda PARA a rede).
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT
         nm.id, nm.name, nm.type, nm.url,
         nm.owner_code,
         sc.name AS owner_name,
         nmd.active
       FROM network_media_distribution nmd
       JOIN network_media nm ON nm.id = nmd.network_media_id
       LEFT JOIN studio_clients sc ON sc.code = nm.owner_code
       WHERE nmd.displayed_on_code = $1
         AND nmd.active = true
         AND nm.status = 'approved'
       ORDER BY nmd.added_at DESC`,
      [code.toUpperCase()]
    )
    return NextResponse.json({ media: rows })
  } catch (err) {
    console.error("[network-media-incoming GET]", err)
    return NextResponse.json({ media: [], error: String(err) }, { status: 500 })
  }
}
