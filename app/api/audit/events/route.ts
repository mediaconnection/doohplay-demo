import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {

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