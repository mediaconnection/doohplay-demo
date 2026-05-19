"use client"

import { use, useEffect, useState } from "react"

type Data = {
  campaign_id: string
  summary: any
  trust: any
  alerts: any[]
  verification: any
  proof: {
    hash: string
    signature: string
    public_key: string
  }
}

export default function ExplorerPage({
  params
}: {
  params: Promise<{ campaign_id: string }>
}) {
  const { campaign_id } = use(params)
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const end = new Date().toISOString()

    fetch(`/api/public/campaign/${campaign_id}?start=${start}&end=${end}`, {
      headers: {
        "x-api-key": "SUA_CHAVE"
      }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [campaign_id])

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!data) return <div style={{ padding: 40 }}>No data</div>

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🔎 Campaign Explorer</h1>

      {/* STATUS */}
      <div style={{
        padding: 20,
        borderRadius: 10,
        background: data.verification.status === "verified"
          ? "#e6ffed"
          : "#fff4e6"
      }}>
        <h2>
          {data.verification.status === "verified"
            ? "✅ Verified"
            : "⚠️ Warning"}
        </h2>
        Score: {data.verification.score}
      </div>

      {/* SUMMARY */}
      <Section title="Summary">
        <Field label="Total Events" value={data.summary.total_events} />
        <Field label="Verified Events" value={data.summary.verified_events} />
        <Field label="Verification Rate" value={data.summary.verification_rate} />
      </Section>

      {/* TRUST */}
      <Section title="Trust">
        <Field label="Average" value={data.trust.average} />
        <Field label="Anchored Rate" value={data.trust.anchored_rate} />
      </Section>

      {/* ALERTS */}
      <Section title="Alerts">
        {data.alerts.length === 0
          ? "✅ No alerts"
          : data.alerts.map((a, i) => (
              <div key={i}>
                ❗ {a.type} ({a.severity})
              </div>
            ))}
      </Section>

      {/* PROOF */}
      <Section title="Cryptographic Proof">
        <Field label="Hash" value={data.proof.hash} />
        <Field label="Signature" value={data.proof.signature} />
      </Section>
    </div>
  )
}

/* =========================
   UI HELPERS
========================= */

function Section({ title, children }: any) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>{title}</h2>
      <div style={{
        padding: 15,
        border: "1px solid #ddd",
        borderRadius: 10
      }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <strong>{label}:</strong>
      <div style={{
        fontFamily: "monospace",
        fontSize: 12,
        wordBreak: "break-all"
      }}>
        {String(value)}
      </div>
    </div>
  )
}