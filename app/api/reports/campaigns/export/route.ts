import { Pool } from "pg";
import { NextResponse } from "next/server";

/* ---------- Banco ---------- */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* ---------- Util ---------- */

function resolvePeriod(period?: string) {
  const end = new Date();
  const start = new Date(end);

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
    default:
      start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/* ---------- GET ---------- */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const period = searchParams.get("period") ?? undefined;
  const campaign = searchParams.get("campaign") ?? undefined;

  const { start, end } = resolvePeriod(period);

  const query = `
    SELECT
      c.name AS campaign,
      COUNT(pl.id) AS executions,
      COALESCE(SUM(pl.duration_seconds), 0) AS seconds,
      25.00::numeric AS cpm,
      ROUND((COUNT(pl.id)::numeric / 1000) * 25.00, 2) AS gross_amount
    FROM public.campaigns c
    LEFT JOIN public.play_logs_certified pl
      ON pl.campaign_id = c.id
     AND pl.created_at >= $1
     AND pl.created_at <  $2
    WHERE ($3::uuid IS NULL OR c.id = $3::uuid)
    GROUP BY c.name
    ORDER BY c.name;
  `;

  const { rows } = await pool.query(query, [
    start,
    end,
    campaign ?? null,
  ]);

  /* ---------- CSV ---------- */

  const header = [
    "Campanha",
    "Execuções",
    "Tempo (s)",
    "CPM",
    "Valor (R$)",
  ];

  const lines = rows.map((r) =>
    [
      r.campaign,
      r.executions,
      r.seconds,
      r.cpm,
      r.gross_amount,
    ].join(";")
  );

  const csv = [header.join(";"), ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-campanhas.csv"`,
    },
  });
}
