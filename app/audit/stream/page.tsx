"use client";

import { useEffect, useState } from "react";

type StreamEvent = {
  event_id: string;
  event_type: string;
  occurred_at: string;
};

export default function ActivityStreamPage() {

  const [events, setEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {

    const source = new EventSource("/api/audit/stream");

    source.onmessage = (msg) => {

      const data = JSON.parse(msg.data);

      if (data.type === "event") {

        setEvents((prev) => [
          data.event,
          ...prev.slice(0, 25)
        ]);

      }

    };

    return () => source.close();

  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>

      <h1>DOOHPLAY Activity Stream</h1>

      <p>
        Real-time advertising playback events recorded in the DOOHPLAY ledger.
      </p>

      <hr />

      {events.map((e) => (

        <div
          key={e.event_id}
          style={{
            borderBottom: "1px solid #ddd",
            padding: "12px 0"
          }}
        >

          <b>{e.event_type}</b>

          <div style={{ fontSize: 13 }}>
            {new Date(e.occurred_at).toLocaleString()}
          </div>

          <code style={{ fontSize: 12 }}>
            {e.event_id}
          </code>

        </div>

      ))}

    </div>
  );
}