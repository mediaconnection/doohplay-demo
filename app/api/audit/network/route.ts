import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {

  try {

    const res = await pool.query(
      `
      SELECT
        id,
        name,
        status,
        city,
        latitude,
        longitude,
        last_seen
      FROM screens
      WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      `
    );

    return Response.json({
      screens: res.rows
    });

  } catch (err: any) {

    console.error("NETWORK API ERROR", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}