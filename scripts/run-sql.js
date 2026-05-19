const fs = require("fs")
const { Client } = require("pg")

const sql = fs.readFileSync("sql/000_core_schema.sql", "utf-8")

const client = new Client({
  connectionString: "postgresql://dooh:doohpass@localhost:55432/doohplay",
})

async function run() {
  await client.connect()
  await client.query(sql)
  console.log("✅ SQL executado com sucesso")
  await client.end()
}

run().catch(console.error)