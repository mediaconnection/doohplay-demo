export type VerifyAllResult = {
  hash: string
  valid: boolean
  layers: Record<string, boolean>
}

export async function verifyAll(_hash: string): Promise<VerifyAllResult> {
  throw new Error("verifyAll: not implemented")
}
