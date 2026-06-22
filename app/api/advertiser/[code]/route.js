import { getPool } from "@/lib/db";

export async function GET(request, { params }) {
  const { code } = params;
  const pool = getPool();

  try {
    const advResult = await pool.query(
      `SELECT * FROM "Advertiser" WHERE code = $1`,
      [code.toUpperCase()]
    );

    if (advResult.rows.length === 0) {
      return Response.json({ error: "Advertiser not found" }, { status: 404 });
    }

    const advertiser = advResult.rows[0];

    const campResult = await pool.query(
      `SELECT c.*, 
        COALESCE(
          json_agg(
            json_build_object('id', cs.id, 'city', cs.city, 'screenId', cs."screenId", 'screenName', cs."screenName")
          ) FILTER (WHERE cs.id IS NOT NULL), '[]'
        ) as screens,
        (
          SELECT json_build_object(
            'invoice_url', cp.invoice_url,
            'status', cp.status,
            'value', cp.value,
            'due_date', cp.due_date
          )
          FROM campaign_payments cp
          WHERE cp.campaign_id = c.id
          ORDER BY cp.created_at DESC
          LIMIT 1
        ) as payment
       FROM "Campaign" c
       LEFT JOIN "CampaignScreen" cs ON cs."campaignId" = c.id
       WHERE c."advertiserCode" = $1
       GROUP BY c.id
       ORDER BY c."createdAt" DESC`,
      [code.toUpperCase()]
    );

    const mediaResult = await pool.query(
      `SELECT m.*, c.name as "campaignName"
       FROM "CampaignMedia" m
       JOIN "Campaign" c ON c.id = m."campaignId"
       WHERE c."advertiserCode" = $1
       ORDER BY m."createdAt" DESC`,
      [code.toUpperCase()]
    );

    return Response.json({
      advertiser,
      campaigns: campResult.rows,
      medias: mediaResult.rows,
    });
  } catch (err) {
    console.error("[advertiser GET]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
