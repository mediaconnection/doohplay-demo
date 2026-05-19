import { Interface, Result } from "ethers"

const ABI = [
  "function storeRoot(bytes32 root)",
  "function anchorMerkle(bytes32 root)"
]

const iface = new Interface(ABI)

export type DecodedTx = {
  name: "storeRoot" | "anchorMerkle" | "unknown"
  args: unknown[]
  root: string | null
  error: string | null
}

function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function isHex64(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

function normalizeBytes32(value: unknown): string | null {
  const normalized = normalizeHex(value)
  return isHex64(normalized) ? normalized : null
}

function serializeArg(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString()
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(serializeArg)
  return value
}

export function decodeTransaction(data: string): DecodedTx | null {
  try {
    if (typeof data !== "string" || !data.trim() || data === "0x") {
      return null
    }

    const parsed = iface.parseTransaction({ data })

    if (!parsed) {
      return {
        name: "unknown",
        args: [],
        root: null,
        error: "UNSUPPORTED_TRANSACTION_DATA"
      }
    }

    const argsArray =
      parsed.args && typeof parsed.args === "object"
        ? Array.from(parsed.args as Result).map(serializeArg)
        : []

    const root = argsArray.length > 0 ? normalizeBytes32(argsArray[0]) : null

    return {
      name:
        parsed.name === "storeRoot" || parsed.name === "anchorMerkle"
          ? parsed.name
          : "unknown",
      args: argsArray,
      root,
      error: null
    }
  } catch (error) {
    return {
      name: "unknown",
      args: [],
      root: null,
      error: error instanceof Error ? error.message : "DECODE_ERROR"
    }
  }
}

export function extractMerkleRootFromTx(data: string): string | null {
  return decodeTransaction(data)?.root ?? null
}