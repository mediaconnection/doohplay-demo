export type SignedEventRecord = {
  event_id: string
  hash: string
  signature: string
  created_at: string
}

export async function createSignedEventRecord(
  _payload: Record<string, unknown>
): Promise<SignedEventRecord> {
  throw new Error("createSignedEventRecord: not implemented")
}
