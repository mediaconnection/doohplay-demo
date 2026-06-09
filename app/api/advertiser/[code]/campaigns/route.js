import { getPool } from "@/lib/db";

export async function POST(request, { params }) {
  const { code } = params;
  const pool = getPool();

  try {
    const body = await request.json();
    const { name, startDate, endDate, budget, screens } = body;

    if (!name || !startDate || !endDate) {
      return Response.json({ error: "name, startDate and endDate are required" }, { status: 400 });
    }

    // Verifica se anunciante existe
    const advCheck = await pool.query(
      `SELECT id FROM "Advertiser" WHERE code = $1`,
      [code.toUpperCase()]
    );
    if (advCheck.rows.length === 0) {
      return Response.json({ error: "Advertiser not found" }, { status: 404 });
    }

    // Cria campanha
    const campResult = await pool.query(
      `INSERT INTO "Campaign" (id, "advertiserCode", name, status, "startDate", "endDate", budget, impressions, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'pending', $3, $4, $5, 0, NOW(), NOW())
       RETURNING *`,
      [code.toUpperCase(), name, startDate, endDate, parseFloat(budget) || 0]
    );

    const campaign = campResult.rows[0];

    // Vincula telas se houver
    if (screens && screens.length > 0) {
      const SCREEN_MAP = {
        "sp-01": { city: "São Paulo",      name: "Shopping Ibirapuera - Hall Central"     },
        "rj-01": { city: "Rio de Janeiro", name: "Shopping Rio Sul - Piso L2"             },
        "bh-01": { city: "Belo Horizonte", name: "BH Shopping - Entrada Principal"        },
        "ct-01": { city: "Curitiba",       name: "Shopping Muller - Praça de Alimentação" },
        "rs-01": { city: "Porto Alegre",   name: "Shopping Iguatemi - Piso 2"             },
        "re-01": { city: "Recife",         name: "Shopping Recife - Corredor Central"     },
        "ss-01": { city: "Salvador",       name: "Shopping da Bahia - Térreo"             },
        "fo-01": { city: "Fortaleza",      name: "North Shopping - Entrada Sul"           },
        "ma-01": { city: "Manaus",         name: "Amazonas Shopping - Piso 1"             },
        "go-01": { city: "Goiânia",        name: "Flamboyant Shopping - Hall Norte"       },
      };

      for (const screenId of screens) {
        const sc = SCREEN_MAP[screenId];
        if (!sc) continue;
        await pool.query(
          `INSERT INTO "CampaignScreen" (id, "campaignId", city, "screenId", "screenName")
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [campaign.id, sc.city, screenId, sc.name]
        );
      }
    }

    return Response.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error("[campaigns POST]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { code } = params;
  const pool = getPool();

  try {
    const result = await pool.query(
      `SELECT c.*, 
        COALESCE(
          json_agg(
            json_build_object('id', cs.id, 'city', cs.city, 'screenId', cs."screenId", 'screenName', cs."screenName")
          ) FILTER (WHERE cs.id IS NOT NULL), '[]'
        ) as screens
       FROM "Campaign" c
       LEFT JOIN "CampaignScreen" cs ON cs."campaignId" = c.id
       WHERE c."advertiserCode" = $1
       GROUP BY c.id
       ORDER BY c."createdAt" DESC`,
      [code.toUpperCase()]
    );

    return Response.json({ campaigns: result.rows });
  } catch (err) {
    console.error("[campaigns GET]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
