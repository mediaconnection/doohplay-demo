import { getPool } from "@/lib/db";

export async function POST(request, { params }) {
  const { code } = params;
  const pool = getPool();

  try {
    const formData = await request.formData();
    const campaignId = formData.get("campaignId");
    const files = formData.getAll("files");

    if (!campaignId) {
      return Response.json({ error: "campaignId is required" }, { status: 400 });
    }

    // Verifica se campanha pertence ao anunciante
    const campCheck = await pool.query(
      `SELECT id FROM "Campaign" WHERE id = $1 AND "advertiserCode" = $2`,
      [campaignId, code.toUpperCase()]
    );
    if (campCheck.rows.length === 0) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    const inserted = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      // Em produção: fazer upload para S3/Cloudflare R2
      // Por ora, salva metadados com URL placeholder
      const url = `/uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

      const result = await pool.query(
        `INSERT INTO "CampaignMedia" (id, "campaignId", url, type, name, status, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW())
         RETURNING *`,
        [campaignId, url, isVideo ? "video" : "image", file.name]
      );

      inserted.push(result.rows[0]);
    }

    return Response.json({ medias: inserted }, { status: 201 });
  } catch (err) {
    console.error("[media POST]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { code } = params;
  const pool = getPool();

  try {
    const result = await pool.query(
      `SELECT m.*, c.name as "campaignName"
       FROM "CampaignMedia" m
       JOIN "Campaign" c ON c.id = m."campaignId"
       WHERE c."advertiserCode" = $1
       ORDER BY m."createdAt" DESC`,
      [code.toUpperCase()]
    );

    return Response.json({ medias: result.rows });
  } catch (err) {
    console.error("[media GET]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
