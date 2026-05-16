export type Signer = {
  sign: (data: string) => Promise<string>
  keyId: string
}

export function getSigner(): Signer {
  throw new Error("getSigner: not implemented")
}
