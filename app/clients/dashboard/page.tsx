type Client = {
  id: number
  name: string
  status: "active" | "inactive"
  events: number
  score: number
}

const clients: Client[] = [
  {
    id: 1,
    name: "Empresa X",
    status: "active",
    events: 12430,
    score: 92,
  },
]

export default function ClientDashboard() {
  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === "active").length

  return (
    <main style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Client Dashboard</h1>

      {/* Overview */}
      <section style={{ marginBottom: 32 }}>
        <h2>Overview</h2>

        <div style={{ display: "flex", gap: 20 }}>
          <Card title="Total Clients" value={totalClients} />
          <Card title="Active" value={activeClients} />
          <Card title="Revenue" value="R$ 320k" />
        </div>
      </section>

      {/* Table */}
      <section>
        <h2>Clients</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Events</th>
              <th style={thStyle}>Score</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td style={tdStyle}>{client.name}</td>
                <td style={tdStyle}>
                  {client.status === "active" ? "🟢 Active" : "🔴 Inactive"}
                </td>
                <td style={tdStyle}>
                  {client.events.toLocaleString()}
                </td>
                <td style={tdStyle}>{client.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}

/* =========================
   COMPONENTS
========================= */

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        minWidth: 150,
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{title}</p>
      <strong style={{ fontSize: 20 }}>{value}</strong>
    </div>
  )
}

/* =========================
   STYLES
========================= */

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #ddd",
}

const tdStyle: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #eee",
}