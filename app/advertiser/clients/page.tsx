import { pool } from "@/lib/db"

/* =========================
   TYPES
========================= */

type Client = {
  id: number
  name: string
  status: "active" | "inactive"
  events: number
  score: number
  created_at: string
}

/* =========================
   PAGE
========================= */

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    page?: string
  }
}) {
  const query = searchParams?.q || ""
  const page = parseInt(searchParams?.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  let clients: Client[] = []
  let total = 0

  try {
    /* =========================
       QUERY
    ========================= */

    const where = query
      ? `WHERE name ILIKE $1`
      : ""

    const values = query ? [`%${query}%`, limit, offset] : [limit, offset]

    const result = await pool.query(
      `
      SELECT id, name, status,
             COALESCE(events,0) as events,
             COALESCE(score,0) as score,
             created_at
      FROM clients
      ${where}
      ORDER BY created_at DESC
      LIMIT $${query ? 2 : 1}
      OFFSET $${query ? 3 : 2}
      `,
      values
    )

    clients = result.rows

    /* =========================
       COUNT
    ========================= */

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM clients
      ${where}
      `,
      query ? [`%${query}%`] : []
    )

    total = parseInt(countResult.rows[0].total)

  } catch (err) {
    console.error("DB ERROR:", err)
  }

  /* =========================
     METRICS
  ========================= */

  const totalClients = total
  const activeClients = clients.filter(c => c.status === "active").length

  const avgScore =
    clients.length > 0
      ? Math.round(
          clients.reduce((acc, c) => acc + c.score, 0) / clients.length
        )
      : 0

  const totalPages = Math.ceil(total / limit)

  /* =========================
     UI
  ========================= */

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Clients Intelligence</h1>

      {/* =========================
          SEARCH
      ========================= */}
      <form style={styles.searchBar}>
        <input
          name="q"
          placeholder="Search client..."
          defaultValue={query}
          style={styles.input}
        />
        <button style={styles.button}>Search</button>
      </form>

      {/* =========================
          OVERVIEW
      ========================= */}
      <section style={styles.section}>
        <div style={styles.cards}>
          <Card title="Total Clients" value={totalClients} />
          <Card title="Active (page)" value={activeClients} />
          <Card title="Avg Score" value={avgScore} />
          <Card title="Page" value={`${page}/${totalPages || 1}`} />
        </div>
      </section>

      {/* =========================
          TABLE
      ========================= */}
      <section>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Events</th>
              <th style={styles.th}>Trust Score</th>
              <th style={styles.th}>Proof</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.name}</td>

                <td style={styles.td}>
                  {c.status === "active" ? "🟢 Active" : "🔴 Inactive"}
                </td>

                <td style={styles.td}>
                  {c.events.toLocaleString()}
                </td>

                <td style={styles.td}>
                  <ScoreBadge score={c.score} />
                </td>

                <td style={styles.td}>
                  🔐 Ready
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* =========================
          PAGINATION
      ========================= */}
      <div style={styles.pagination}>
        {page > 1 && (
          <a href={`?q=${query}&page=${page - 1}`}>⬅ Prev</a>
        )}

        <span>Page {page}</span>

        {page < totalPages && (
          <a href={`?q=${query}&page=${page + 1}`}>Next ➡</a>
        )}
      </div>
    </main>
  )
}

/* =========================
   COMPONENTS
========================= */

function Card({ title, value }: any) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <strong style={styles.cardValue}>{value}</strong>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  let color = "#999"

  if (score >= 80) color = "#16a34a"
  else if (score >= 50) color = "#f59e0b"
  else color = "#dc2626"

  return (
    <span style={{
      padding: "4px 8px",
      borderRadius: 6,
      background: color,
      color: "#fff"
    }}>
      {score}
    </span>
  )
}

/* =========================
   STYLES
========================= */

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, fontFamily: "Arial" },
  title: { marginBottom: 20 },

  searchBar: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  input: {
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 6,
  },

  button: {
    padding: "8px 12px",
    background: "#111",
    color: "#fff",
    borderRadius: 6,
    border: "none",
  },

  section: { marginBottom: 30 },

  cards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },

  card: {
    border: "1px solid #eee",
    padding: 16,
    borderRadius: 8,
    minWidth: 140,
  },

  cardTitle: { fontSize: 12, color: "#666" },
  cardValue: { fontSize: 20 },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    textAlign: "left",
    padding: 10,
    borderBottom: "2px solid #eee",
  },

  td: {
    padding: 10,
    borderBottom: "1px solid #f3f3f3",
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
}