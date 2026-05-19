const { Client } = require("pg")

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dooh:doohpass@localhost:55432/doohplay"

async function main() {
  const client = new Client({
    connectionString,
    ssl: false,
  })

  try {
    await client.connect()

    const counts = await client.query(`
      select
        (select count(*) from public.event_chain) as event_chain_count,
        (select count(*) from public.event_blocks) as event_blocks_count
    `)

    console.log("COUNTS:")
    console.dir(counts.rows, { depth: null })

    const latestEvents = await client.query(`
      select
        id,
        event_id,
        event_type,
        event_hash,
        block_id,
        merkle_root,
        blockchain_tx,
        occurred_at,
        created_at
      from public.event_chain
      order by created_at desc
      limit 10
    `)

    console.log("LATEST_EVENTS:")
    console.dir(latestEvents.rows, { depth: null })

    const latestBlocks = await client.query(`
      select
        id,
        block_id,
        block_hash,
        merkle_root,
        tx_hash,
        event_count,
        created_at
      from public.event_blocks
      order by created_at desc
      limit 10
    `)

    console.log("LATEST_BLOCKS:")
    console.dir(latestBlocks.rows, { depth: null })
  } catch (error) {
    console.error("DB_ERROR:", error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()