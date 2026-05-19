import { JsonRpcProvider, Wallet } from "ethers"

/* =========================
   RPC CONFIG (FALLBACK)
========================= */

const RPCS = [
  process.env.POLYGON_RPC_URL,
  process.env.NEXT_PUBLIC_POLYGON_RPC,
  "https://polygon-rpc.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
].filter(Boolean) as string[]

if (!RPCS.length) {
  throw new Error("No Polygon RPC configured")
}

/* =========================
   PROVIDER (LAZY + SAFE)
========================= */

let _provider: JsonRpcProvider | null = null

export function getProvider(): JsonRpcProvider {
  if (!_provider) {
    _provider = new JsonRpcProvider(RPCS[0])
  }
  return _provider
}

/* =========================
   WALLET (SAFE LOAD)
========================= */

let _wallet: Wallet | null = null

export function getWallet(): Wallet {
  if (_wallet) return _wallet

  const pk = process.env.BLOCKCHAIN_PRIVATE_KEY

  if (!pk) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY not set")
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(pk)) {
    throw new Error("Invalid PRIVATE KEY format")
  }

  _wallet = new Wallet(pk, getProvider())

  return _wallet
}