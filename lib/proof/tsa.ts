export type TSATimestampResult = {
  token: string | null
  time: string
  mode: "LOCAL_DEV_TSA"
  hash: string
}

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

export async function requestTSATimestamp(
  hash: string
): Promise<TSATimestampResult> {
  return {
    token: null,
    time: new Date().toISOString(),
    mode: "LOCAL_DEV_TSA",
    hash: normalizeHash(hash)
  }
}