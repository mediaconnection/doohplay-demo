import { db } from "@/lib/db";
import { processNotificationRetry } from "@/core/alerts/processNotificationRetry";

async function run() {
  const { rows } = await db.query(
    `
    SELECT id
    FROM notifications
    WHERE status = 'retrying'
      AND next_retry_at <= NOW()
    LIMIT 20
    `
  );

  for (const row of rows) {
    await processNotificationRetry(row.id);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("❌ Retry job failed", err);
  process.exit(1);
});
