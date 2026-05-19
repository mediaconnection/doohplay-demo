import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaign_id: string }> }
) {

  const { campaign_id } = await params;

  try {

    const res = await pool.query(
      `
      SELECT
        event_id,
        event_type,
        occurred_at,
        event_hash,
        previous_event_hash
      FROM event_chain
      WHERE payload->>'campaign_id' = $1
      ORDER BY occurred_at ASC
      `,
      [campaign_id]
    );

    return NextResponse.json({
      campaign_id,
      events: res.rows
    });

  } catch (err: any) {

    console.error("CAMPAIGN TIMELINE ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}