export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";


export async function GET() {

  const stream = new ReadableStream({

    async start(controller) {

      const encoder = new TextEncoder();

      async function sendEvents() {

        const res = await pool.query(`
          SELECT
            event_id,
            event_type,
            occurred_at
          FROM event_chain
          ORDER BY occurred_at DESC
          LIMIT 1
        `);

        if (res.rows.length > 0) {

          const payload = {
            type: "event",
            event: res.rows[0]
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );

        }

      }

      await sendEvents();

      const interval = setInterval(sendEvents, 2000);

      return () => clearInterval(interval);
    }

  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

}
