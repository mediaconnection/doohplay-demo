export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const { year, month } = await req.json();

  if (!year || !month) {
    return NextResponse.json(
      { error: "year e month são obrigatórios" },
      { status: 400 }
    );
  }

  const exists = await pool.query(
    `
    SELECT 1
    FROM monthly_financial_snapshots
    WHERE year = $1 AND month = $2
    LIMIT 1
    `,
    [year, month]
  );

  if (exists.rowCount > 0) {
    return NextResponse.json(
      { error: "Mês já fechado" },
      { status: 409 }
    );
  }

  await pool.query(
    `
    INSERT INTO monthly_financial_snapshots (
      year, month,
      campaign_id, campaign_name,
      executions_done, total_seconds,
      cpm, gross_amount
    )
    SELECT
      $1, $2,
      c.id, c.name,
      COUNT(pl.id),
      COALESCE(SUM(pl.duration_seconds), 0),
      25.00,
      ROUND((COUNT(pl.id) / 1000.0) * 25.00, 2)
    FROM campaigns c
    LEFT JOIN play_logs_certified pl
      ON pl.campaign_id = c.id
     AND date_trunc('month', pl.started_at) = make_date($1, $2, 1)
    GROUP BY c.id, c.name
    `,
    [year, month]
  );

  return NextResponse.json({ success: true });
}

