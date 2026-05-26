export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const campaign_id = searchParams.get("campaign_id");

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id required" },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `
      SELECT
        campaign_id,
        COUNT(*)::int as impressions
      FROM impression_ledger
      WHERE campaign_id = $1
      GROUP BY campaign_id
      `,
      [campaign_id]
    );

    if (res.rows.length === 0) {

      return NextResponse.json({
        campaign_id,
        impressions: 0
      });

    }

    return NextResponse.json(res.rows[0]);

  } catch (err: any) {

    console.error("CAMPAIGN PROOF ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}

