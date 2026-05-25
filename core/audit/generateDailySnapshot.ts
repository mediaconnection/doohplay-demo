// @ts-nocheck
import { pool } from "@/lib/db";
import crypto from "crypto";

export async function generateDailySnapshot(date: string) {

  const res = await pool.query(
    `
    SELECT event_hash
    FROM public.event_chain
    WHERE DATE(occurred_at) = $1
    ORDER BY occurred_at ASC
    `,
    [date]
  );

  const hashes = res.rows.map((r: Record<string, unknown>) => r.event_hash);

  if (hashes.length === 0) {
    return null;
  }

  const root = crypto
    .createHash("sha256")
    .update(hashes.join(""))
    .digest("hex");

  await pool.query(
    `
    INSERT INTO audit_daily_snapshots
    (snapshot_date, events_count, merkle_root)
    VALUES ($1, $2, $3)
    `,
    [date, hashes.length, root]
  );

  return {
    date,
    events: hashes.length,
    merkle_root: root
  };

}
