const fs = require("fs")
const path = require("path")
const { Client } = require("pg")

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dooh:doohpass@localhost:55432/doohplay"

async function run() {
  const file = process.argv[2]

  if (!file) {
    console.error("❌ Informe o arquivo SQL")
    process.exit(1)
  }

  const filePath = path.resolve(file)

  if (!fs.existsSync(filePath)) {
    console.error("❌ Arquivo não encontrado:", filePath)
    process.exit(1)
  }

  const sql = fs.readFileSync(filePath, "utf-8")

  const client = new Client({
    connectionString,
    ssl: false,
  })

  try {
    console.log("🔌 Conectando no banco...")
    await client.connect()

    console.log("📄 Executando:", filePath)

    await client.query(sql)

    console.log("✅ SQL executado com sucesso")
  } catch (err) {
    console.error("❌ ERRO SQL:", err)
  } finally {
    await client.end()
  }
}

run()