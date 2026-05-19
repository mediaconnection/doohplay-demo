"use client";

import { useEffect, useState } from "react";

type FraudData = {
  suspicious_loops: any[];
  offline_screens: any[];
  campaign_anomalies: any[];
};

export default function FraudMonitorPage() {

  const [data, setData] = useState<FraudData | null>(null);

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/audit/fraud");

      const json = await res.json();

      setData(json);

    }

    load();

  }, []);

  if (!data) {
    return <div style={{ padding: 40 }}>Loading fraud monitor...</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>

      <h1>DOOHPLAY Fraud Detection Monitor</h1>

      <p>
        Automatic detection of suspicious playback behavior in the DOOHPLAY network.
      </p>

      <hr />

      <h2>Suspicious Playback Loops</h2>

      {data.suspicious_loops.length === 0 && <p>No suspicious loops detected.</p>}

      {data.suspicious_loops.map((l: any) => (

        <div key={l.device_id}>
          <b>{l.device_id}</b> — {l.plays} plays in 10 minutes
        </div>

      ))}

      <hr />

      <h2>Offline Screens</h2>

      {data.offline_screens.length === 0 && <p>All screens active.</p>}

      {data.offline_screens.map((s: any) => (

        <div key={s.device_id}>
          <b>{s.device_id}</b>
        </div>

      ))}

      <hr />

      <h2>Campaign Anomalies</h2>

      {data.campaign_anomalies.length === 0 && <p>No anomalies detected.</p>}

      {data.campaign_anomalies.map((c: any) => (

        <div key={c.campaign_id}>
          <b>{c.campaign_id}</b> — {c.plays} plays in last hour
        </div>

      ))}

    </div>
  );
}