import { pool } from "@/lib/db"

type BlockPageProps = {
  params: {
    block_id: string
  }
}

export default async function BlockAuditPage({ params }: BlockPageProps) {

  const blockId = params.block_id

  /* =========================
     FETCH BLOCK
  ========================= */

  const blockRes = await pool.query(
    `
    SELECT
      id,
      merkle_root,
      block_hash,
      prev_block_hash,
      signature,
      tx_hash,
      network,
      created_at,
      anchored_at
    FROM event_blocks
    WHERE id = $1
    `,
    [blockId]
  )

  if (blockRes.rowCount === 0) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Block not found</h1>
      </div>
    )
  }

  const block = blockRes.rows[0]

  /* =========================
     FETCH EVENTS
  ========================= */

  const eventsRes = await pool.query(
    `
    SELECT
      id,
      event_id,
      event_type,
      event_hash,
      created_at
    FROM event_chain
    WHERE block_id = $1
    ORDER BY created_at ASC
    `,
    [blockId]
  )

  const events = eventsRes.rows

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>

      <h1>🔍 Block Audit</h1>

      {/* =========================
         BLOCK INFO
      ========================= */}

      <div style={{ marginTop: 30 }}>

        <h2>Block Info</h2>

        <p><b>ID:</b> {block.id}</p>
        <p><b>Created:</b> {new Date(block.created_at).toLocaleString()}</p>

        <p><b>Total Events:</b> {events.length}</p>

        <p><b>Merkle Root:</b></p>
        <code style={{ wordBreak: "break-all" }}>{block.merkle_root}</code>

        <p style={{ marginTop: 10 }}><b>Block Hash:</b></p>
        <code style={{ wordBreak: "break-all" }}>{block.block_hash}</code>

        <p style={{ marginTop: 10 }}><b>Previous Hash:</b></p>
        <code style={{ wordBreak: "break-all" }}>
          {block.prev_block_hash || "GENESIS"}
        </code>

        <p style={{ marginTop: 10 }}><b>Signature:</b></p>
        <code style={{ wordBreak: "break-all" }}>{block.signature}</code>

      </div>

      {/* =========================
         ANCHOR
      ========================= */}

      <div style={{ marginTop: 30 }}>

        <h2>Blockchain Anchor</h2>

        {block.tx_hash ? (
          <>
            <p><b>Network:</b> {block.network}</p>
            <p><b>Tx Hash:</b></p>
            <code style={{ wordBreak: "break-all" }}>{block.tx_hash}</code>

            <p style={{ marginTop: 10 }}>
              <b>Anchored At:</b>{" "}
              {block.anchored_at
                ? new Date(block.anchored_at).toLocaleString()
                : "—"}
            </p>
          </>
        ) : (
          <p>⚠️ Not anchored</p>
        )}

      </div>

      {/* =========================
         EVENTS
      ========================= */}

      <div style={{ marginTop: 40 }}>

        <h2>Events ({events.length})</h2>

        <div style={{ marginTop: 20 }}>

          {events.map((e: any) => (
            <div
              key={e.id}
              style={{
                border: "1px solid #ddd",
                padding: 15,
                marginBottom: 10,
                borderRadius: 8
              }}
            >

              <p><b>Event ID:</b> {e.event_id}</p>
              <p><b>Type:</b> {e.event_type}</p>
              <p><b>Created:</b> {new Date(e.created_at).toLocaleString()}</p>

              <p><b>Hash:</b></p>
              <code style={{ wordBreak: "break-all" }}>
                {e.event_hash}
              </code>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}