export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db";


export async function GET() {

  const encoder = new TextEncoder();

  const stream = new ReadableStream({

    async start(controller) {

      let lastTimestamp: string | null = null;

      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // envia evento inicial
      send({ type: "connected", message: "DOOHPLAY live stream started" });

      const interval = setInterval(async () => {

        try {

          const res = await pool.query(
            `
            SELECT
              event_id,
              event_type,
              occurred_at
            FROM event_chain
            ORDER BY occurred_at DESC
            LIMIT 1
            `
          );

          if (!res.rows.length) return;

          const event = res.rows[0];

          if (event.occurred_at !== lastTimestamp) {

            lastTimestamp = event.occurred_at;

            send({
              type: "event",
              event
            });

          }

        } catch (err) {

          send({
            type: "error",
            message: "stream error"
          });

        }

      }, 2000);

      return () => clearInterval(interval);

    }

  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });

}
