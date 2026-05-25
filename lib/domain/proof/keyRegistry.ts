// @ts-nocheck
export type ActiveKey = {
  keyId: string
  publicKey: string
  algorithm: string
}

export function getActiveKey(): ActiveKey {
  throw new Error("getActiveKey: not implemented")
}

