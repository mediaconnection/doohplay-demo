export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";

export async function GET() {
    const { pool } = await import("@/lib/db")


  try {

    const res = await pool.query(`
      SELECT
        event_id,
        event_type,
        occurred_at,
        event_hash,
        previous_event_hash
      FROM public.event_chain
      ORDER BY occurred_at ASC
    `);

    return NextResponse.json({
      events: res.rows
    });

  } catch (err: any) {

    console.error("EVENT LIST ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}

