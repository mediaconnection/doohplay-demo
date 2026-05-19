"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventItem {
  event_id: string;
  event_hash: string;
  previous_hash: string;
  event_type: string;
  occurred_at: string;
}

export default function LedgerChain() {

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch("/api/ledger/chain");

        const data = await res.json();

        setEvents(data);

      } catch (err) {

        console.error("Ledger chain load error", err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {
    return <div>Loading ledger...</div>;
  }

  if (!events.length) {
    return <div>No events found</div>;
  }

  return (
    <div style={{ marginTop: 30 }}>

      {events.map((event, index) => {

        const shortHash = event.event_hash?.slice(0, 16) + "...";

        return (

          <div key={event.event_id}>

            <div
              style={{
                border: "1px solid #ddd",
                padding: 15,
                borderRadius: 6,
                marginBottom: 10,
                background: "#fafafa"
              }}
            >

              <div style={{ fontWeight: "bold" }}>
                {event.event_type}
              </div>

              <div style={{ fontSize: 12, marginTop: 5 }}>
                {new Date(event.occurred_at).toLocaleString()}
              </div>

              <div style={{ marginTop: 10 }}>
                <code>{shortHash}</code>
              </div>

              <div style={{ marginTop: 10 }}>
                <Link href={`/ledger/event/${event.event_id}`}>
                  View Event
                </Link>
              </div>

            </div>

            {index < events.length - 1 && (

              <div
                style={{
                  textAlign: "center",
                  marginBottom: 10,
                  fontSize: 20
                }}
              >
                ↓
              </div>

            )}

          </div>

        );

      })}

    </div>
  );

}