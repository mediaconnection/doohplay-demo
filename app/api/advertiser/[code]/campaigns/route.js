// app/api/advertiser/[code]/campaigns/route.ts
import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// POST — cria nova campanha para o anunciante
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()

  try {
    const body = await req.json()
    const { name, startDate, endDate, budget, screens } = body

    if (!name || !startDate || !endDate) {
      return Response.json({ error: "name, startDate e endDate são obrigatórios" }, { status: 400 })
    }

    // Verifica se anunciante existe
    const { rows: adv } = await pool.query(
      `SELECT id FROM "Advertiser" WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )
    if (!adv[0]) return Response.json({ error: "Anunciante não encontrado" }, { status: 404 })

    // Cria campanha
    const { rows } = await pool.query(
      `INSERT INTO "Campaign"
         ("advertiserCode", name, status, "startDate", "endDate", budget, impressions)
       VALUES ($1, $2, 'active', $3::date, $4::date, $5, 0)
       RETURNING *`,
      [
        code.toUpperCase(),
        name.trim(),
        startDate,
        endDate,
        budget ? Number(budget) : 0,
      ]
    )
    const campaign = rows[0]

    // Insere telas selecionadas
    if (Array.isArray(screens) && screens.length > 0) {
      // screens é array de IDs mock — salva cidade+nome como referência
      const SCREEN_MAP: Record<string, { city: string; name: string }> = {
        "sp-01": { city: "São Paulo",      name: "Shopping Ibirapuera - Hall Central"       },
        "rj-01": { city: "Rio de Janeiro", name: "Shopping Rio Sul - Piso L2"               },
        "bh-01": { city: "Belo Horizonte", name: "BH Shopping - Entrada Principal"          },
        "ct-01": { city: "Curitiba",       name: "Shopping Muller - Praça de Alimentação"   },
        "rs-01": { city: "Porto Alegre",   name: "Shopping Iguatemi - Piso 2"               },
        "re-01": { city: "Recife",         name: "Shopping Recife - Corredor Central"       },
        "ss-01": { city: "Salvador",       name: "Shopping da Bahia - Térreo"               },
        "fo-01": { city: "Fortaleza",      name: "North Shopping - Entrada Sul"             },
        "ma-01": { city: "Manaus",         name: "Amazonas Shopping - Piso 1"               },
        "go-01": { city: "Goiânia",        name: "Flamboyant Shopping - Hall Norte"         },
      }
      for (const screenId of screens) {
        const sc = SCREEN_MAP[screenId]
        if (!sc) continue
        await pool.query(
          `INSERT INTO "CampaignScreen" ("campaignId", city, "screenId", "screenName")
           VALUES ($1, $2, $3, $4)`,
          [campaign.id, sc.city, screenId, sc.name]
        )
      }
    }

    return Response.json({ ok: true, campaign }, { status: 201 })
  } catch (err) {
    console.error("[campaigns POST]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
