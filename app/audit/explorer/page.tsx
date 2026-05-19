"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ExplorerData = {
  stats: { total_events: number };
  latest_events: any[];
  top_campaigns: any[];
};

export default function ExplorerPage() {

  const [data, setData] = useState<ExplorerData | null>(null);

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/audit/explorer");

      const json = await res.json();

      setData(json);

    }

    load();

  }, []);

  if (!data) {
    return <div style={{ padding: 40 }}>Loading explorer...</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1000, margin: "0 auto" }}>

      <h1>DOOHPLAY Ledger Explorer</h1>

      <p>
        Public explorer of events recorded in the DOOHPLAY cryptographic ledger.
      </p>

      <hr />

      <h2>Network Statistics</h2>

      <p>
        <b>Total Events</b><br />
        {data.stats.total_events}
      </p>

      <hr />

      <h2>Latest Events</h2>

      {data.latest_events.map((e) => (

        <div key={e.event_id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>

          <b>{e.event_type}</b>

          <div style={{ fontSize: 12 }}>
            {new Date(e.occurred_at).toLocaleString()}
          </div>

          <Link href={`/verify/${e.event_id}`}>
            {e.event_id}
          </Link>

        </div>

      ))}

      <hr />

      <h2>Top Campaigns</h2>

      {data.top_campaigns.map((c) => (

        <div key={c.campaign_id}>

          <Link href={`/audit/campaign/${c.campaign_id}`}>
            {c.campaign_id}
          </Link>

          <div style={{ fontSize: 12 }}>
            {c.plays} plays
          </div>

        </div>

      ))}

    </div>
  );
}