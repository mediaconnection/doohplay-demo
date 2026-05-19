"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

type Stats = {
  total_events: number;
  events_today: number;
  ad_plays_today: number;
  last_event: any;
  events_per_hour: { hour: string; total: number }[];
  events_by_type: { event_type: string; total: number }[];
};

export default function AuditDashboardPage() {

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/audit/stats");

      const data = await res.json();

      setStats(data);

    }

    load();

  }, []);

  if (!stats) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1000, margin: "0 auto" }}>

      <h1>DOOHPLAY Ledger Dashboard</h1>

      <p>
        Real-time analytics of events recorded in the DOOHPLAY cryptographic ledger.
      </p>

      <hr />

      <div style={{ display: "flex", gap: 40 }}>

        <div>
          <h3>Total Events</h3>
          <p style={{ fontSize: 28 }}>{stats.total_events}</p>
        </div>

        <div>
          <h3>Events Today</h3>
          <p style={{ fontSize: 28 }}>{stats.events_today}</p>
        </div>

        <div>
          <h3>Ad Plays Today</h3>
          <p style={{ fontSize: 28 }}>{stats.ad_plays_today}</p>
        </div>

      </div>

      <hr />

      <h2>Events (Last 24h)</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={stats.events_per_hour}>
          <XAxis
            dataKey="hour"
            tickFormatter={(h) =>
              new Date(h).toLocaleTimeString([], { hour: "2-digit" })
            }
          />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#333" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <hr />

      <h2>Events by Type</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stats.events_by_type}>
          <XAxis dataKey="event_type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#333" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}