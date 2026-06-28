// app/api/player/activate/route.ts
// Fluxo de ativação/pareamento de dispositivo, escopado ao nosso modelo
// simples (studio_clients.code) — deliberadamente SEM tocar em tenant_id
// nem em arquivos de core//src/ (sistema de prova/blockchain separado, que
// já tem seu próprio fluxo de pareamento mais sofisticado e acoplado à
// cadeia de auditoria). Reaproveita colunas já existentes na tabela
// `players` (device_fingerprint, paired, paired_at, player_code) sem
// precisar de nenhuma migration nova.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

function activationCodeFromId(id: string) {
  // Código curto e legível pra exibir na tela do dispositivo durante o
  // pareamento — derivado do próprio id, sem precisar de coluna nova.
  return `DHP-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

// POST — dispositivo chama isso na primeira abertura, sem nenhum código
// configurado. Cria (ou reaproveita) um registro players não pareado.
export async function POST(req: NextRequest) {
  const pool = getPool()
  const body = await req.json().catch(() => ({}))
  const deviceFingerprint = String(body.device_fingerprint || "").trim()
  const deviceType = body.device_type ? String(body.device_type).slice(0, 100) : null
  const platform = body.platform ? String(body.platform).slice(0, 50) : null

  if (!deviceFingerprint) {
    return NextResponse.json({ error: "device_fingerprint obrigatório" }, { status: 400 })
  }
  if (deviceFingerprint.length < 8 || deviceFingerprint.length > 200) {
    return NextResponse.json({ error: "device_fingerprint inválido" }, { status: 400 })
  }

  try {
    // Reaproveita registro existente pro mesmo fingerprint, em vez de criar
    // um novo a cada reinstalação do mesmo aparelho.
    const existing = await pool.query(
      `SELECT id, paired, player_code FROM players WHERE device_fingerprint = $1 LIMIT 1`,
      [deviceFingerprint]
    )

    let playerId: string
    if (existing.rows[0]) {
      playerId = existing.rows[0].id
      if (existing.rows[0].paired) {
        // Já foi pareado antes — devolve direto o código final, sem
        // precisar repetir a etapa de ativação.
        return NextResponse.json({
          paired: true,
          code: existing.rows[0].player_code,
        })
      }
    } else {
      // Limite defensivo contra spam: se já existem muitos dispositivos
      // recém-criados aguardando pareamento, algo está gerando volume
      // anormal (spam ou bug) — bloqueia novas criações até alguém
      // investigar, sem afetar dispositivos já existentes/pareados.
      const recentUnpaired = await pool.query(
        `SELECT COUNT(*) FROM players
         WHERE (paired = false OR paired IS NULL)
           AND created_at > NOW() - INTERVAL '1 hour'`
      )
      if (Number(recentUnpaired.rows[0]?.count ?? 0) > 50) {
        console.warn("[player/activate] limite de ativações na última hora excedido")
        return NextResponse.json({ error: "Limite de ativações atingido, tente novamente mais tarde" }, { status: 429 })
      }

      const created = await pool.query(
        `INSERT INTO players (id, device_fingerprint, device_type, platform, paired, is_active, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, false, true, NOW())
         RETURNING id`,
        [deviceFingerprint, deviceType, platform]
      )
      playerId = created.rows[0].id
    }

    return NextResponse.json({
      paired: false,
      player_id: playerId,
      activation_code: activationCodeFromId(playerId),
    })
  } catch (err: any) {
    console.error("[player/activate POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — dispositivo faz polling disso (ex: a cada 5s) enquanto mostra o
// código de ativação na tela, esperando alguém vincular no admin.
export async function GET(req: NextRequest) {
  const pool = getPool()
  const playerId = req.nextUrl.searchParams.get("player_id")
  if (!playerId) {
    return NextResponse.json({ error: "player_id obrigatório" }, { status: 400 })
  }

  try {
    const res = await pool.query(
      `SELECT paired, player_code FROM players WHERE id = $1 LIMIT 1`,
      [playerId]
    )
    if (!res.rows[0]) {
      return NextResponse.json({ error: "player não encontrado" }, { status: 404 })
    }
    if (!res.rows[0].paired) {
      return NextResponse.json({ paired: false })
    }
    return NextResponse.json({ paired: true, code: res.rows[0].player_code })
  } catch (err: any) {
    console.error("[player/activate GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
