"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchPage() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);

  async function search() {

    const res = await fetch(`/api/audit/search?q=${encodeURIComponent(query)}`);

    const json = await res.json();

    setResults(json);

  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>

      <h1>DOOHPLAY Ledger Search</h1>

      <p>
        Search the DOOHPLAY cryptographic ledger by event ID, campaign ID, screen ID or hash.
      </p>

      <hr />

      <div style={{ display: "flex", gap: 10 }}>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter event ID, campaign ID, screen ID or hash"
          style={{ flex: 1, padding: 8 }}
        />

        <button onClick={search}>
          Search
        </button>

      </div>

      <hr />

      {results && (

        <div>

          <h2>Events</h2>

          {results.events.map((e: any) => (

            <div key={e.event_id}>

              <Link href={`/verify/${e.event_id}`}>
                {e.event_id}
              </Link>

              <div style={{ fontSize: 12 }}>
                {e.event_type} — {new Date(e.occurred_at).toLocaleString()}
              </div>

            </div>

          ))}

          <h2>Campaigns</h2>

          {results.campaigns.map((c: any) => (

            <div key={c.campaign_id}>

              <Link href={`/audit/campaign/${c.campaign_id}`}>
                {c.campaign_id}
              </Link>

              <div style={{ fontSize: 12 }}>
                {c.plays} plays
              </div>

            </div>

          ))}

          <h2>Screens</h2>

          {results.screens.map((s: any) => (

            <div key={s.device_id}>

              {s.device_id}

              <div style={{ fontSize: 12 }}>
                {s.events} events
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}