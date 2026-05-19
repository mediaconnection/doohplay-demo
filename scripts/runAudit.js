import { auditSystem } from "./auditSystem"

async function run() {
  const hash = process.argv[2]

  if (!hash) {
    console.error("Usage: npm run audit-system <hash>")
    process.exit(1)
  }

  console.log("\n🔍 DOOHPLAY SYSTEM AUDIT\n")

  const results = await auditSystem(hash)

  for (const r of results) {
    console.log(
      `${r.ok ? "✔" : "✖"} ${r.step}`,
      r.ok ? "" : r.details || ""
    )
  }

  const failed = results.filter(r => !r.ok)

  console.log("\n-------------------------")

  if (failed.length === 0) {
    console.log("✅ SYSTEM OK (PRODUCTION READY)")
  } else {
    console.log(`❌ ${failed.length} ISSUES FOUND`)
  }

  console.log("")
}

run()