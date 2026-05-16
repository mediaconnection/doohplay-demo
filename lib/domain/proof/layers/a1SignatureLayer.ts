export type A1LayerInput = {
  hash: string
  [key: string]: unknown
}

export type A1LayerResult = {
  valid: boolean
  signature?: string
  error?: string
}

export async function a1SignatureLayer(
  _input: A1LayerInput
): Promise<A1LayerResult> {
  throw new Error("a1SignatureLayer: not implemented")
}
