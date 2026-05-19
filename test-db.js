const hash =
  process.argv[2] ||
  "0xabc123verifylocal000000000000000000000000000000000000000000000001"

async function main() {
  const url = `http://localhost:3000/api/verify/${hash}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    console.log("STATUS_CODE:", res.status)
    console.dir(data, { depth: null })
  } catch (error) {
    console.error("VERIFY_TEST_ERROR:", error)
    process.exitCode = 1
  }
}

main()