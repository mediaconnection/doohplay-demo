export type ICPVerifyResult = {
  valid: boolean
  principal?: string
  timestamp?: string
  certificate?: {
    subject?: string
    issuer?: string
    fingerprint?: string
    valid_from?: string
    valid_to?: string
  } | null
}

export async function verifyICP(
  _hash: string,
  _contentHash?: string
): Promise<ICPVerifyResult> {
  throw new Error("verifyICP: ICP integration not implemented")
}
