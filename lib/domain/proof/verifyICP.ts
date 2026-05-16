export type ICPVerifyResult = {
  valid: boolean
  principal?: string
  timestamp?: string
}

export async function verifyICP(_hash: string): Promise<ICPVerifyResult> {
  throw new Error("verifyICP: ICP integration not implemented")
}
