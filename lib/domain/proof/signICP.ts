// @ts-nocheck
export type SignResult = {
  signature: string
  keyId: string
  timestamp: string
}

export async function signBlockHash(_hash: string): Promise<SignResult> {
  throw new Error("signBlockHash: ICP signing not implemented")
}

