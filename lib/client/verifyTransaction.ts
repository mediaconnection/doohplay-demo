/* =========================
   TYPES
========================= */

type TxResult = {
  valid: boolean
  onchain_data?: string
}

type JsonRpcTx = {
  input?: string
  blockNumber?: string | null
}

/* =========================
   RPC CONFIG (FALLBACK)
========================= */

const RPCS = [
  process.env.NEXT_PUBLIC_POLYGON_RPC,
  "https://polygon-rpc.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
].filter((v): v is string => Boolean(v))

/* =========================
   UTILS
========================= */

function normalize(hex: string): string {
  return (hex || "").toLowerCase().replace(/^0x/, "")
}

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalize(hash))
}

/* =========================
   FETCH TX (WITH FALLBACK)
========================= */

async function fetchTx(txHash: string): Promise<JsonRpcTx | null> {
  for (const url of RPCS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    try {
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [txHash],
          id: 1
        })
      })

      if (!res.ok) {
        continue
      }

      const json = await res.json()

      if (json?.error) {
        console.warn("RPC error:", url, json.error)
        continue
      }

      if (json?.result) {
        return json.result
      }

    } catch (err) {
      console.warn("RPC failed:", url)
    } finally {
      clearTimeout(timeout)
    }
  }

  return null
}

/* =========================
   VERIFY TX (POLYGON)
========================= */

export async function verifyTxOnchain(
  txHash: string,
  expectedData: string
): Promise<TxResult> {

  if (!txHash || !expectedData) {
    throw new Error("Missing txHash or expectedData")
  }

  if (!isValidHash(txHash)) {
    throw new Error("Invalid tx hash")
  }

  if (!isValidHash(expectedData)) {
    throw new Error("Invalid expected data")
  }

  const tx = await fetchTx(txHash)

  if (!tx || !tx.input) {
    return { valid: false }
  }

  const onchainData = normalize(tx.input)

  // ⚠️ ignora "0x" vazio
  if (!onchainData || onchainData.length !== 64) {
    return { valid: false }
  }

  const expected = normalize(expectedData)

  return {
    valid: onchainData === expected,
    onchain_data: onchainData
  }
}