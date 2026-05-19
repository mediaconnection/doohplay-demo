"use client";

import { useEffect, useState } from "react";

type LiveEvent = {
  event_id: string;
  event_type: string;
  occurred_at: string;
};

type ConnectionStatus = "connecting" | "live" | "error";

export default function LiveAuditPage() {

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {

    const source = new EventSource("/api/audit/live");

    source.onopen = () => {
      setStatus("live");
    };

    source.onmessage = (msg) => {

      try {

        const data = JSON.parse(msg.data);

        if (data.type === "event" && data.event) {

          const event: LiveEvent = data.event;

          setEvents((prev) => {

            // evita duplicação
            if (prev.find((e) => e.event_id === event.event_id)) {
              return prev;
            }

            return [
              event,
              ...prev
            ].slice(0, 20); // limite 20 eventos

          });

        }

      } catch (err) {

        console.error("Live stream parse error", err);

      }

    };

    source.onerror = () => {
      setStatus("error");
    };

    return () => {
      source.close();
    };

  }, []);

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial",
        maxWidth: 900,
        margin: "0 auto"
      }}
    >

      <h1>DOOHPLAY Live Event Stream</h1>

      <p>
        Real-time events recorded in the DOOHPLAY cryptographic ledger.
      </p>

      <p style={{ fontSize: 14, opacity: 0.7 }}>
        Status:{" "}
        {status === "live" && "🟢 LIVE"}
        {status === "connecting" && "🟡 Connecting"}
        {status === "error" && "🔴 Connection error"}
      </p>

      <hr />

      {events.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          Waiting for events...
        </p>
      )}

      {events.map((e) => (

        <div
          key={e.event_id}
          style={{
            borderBottom: "1px solid #ddd",
            padding: "10px 0"
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