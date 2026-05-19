function normalizePart(value: string): string {
  return value.trim().toLowerCase()
}

export const keys = {
  merkle(hash: string): string {
    return `layer:merkle:${normalizePart(hash)}`
  },

  tx(txHash: string): string {
    return `layer:blockchain:${normalizePart(txHash)}`
  },

  icp(hash: string): string {
    return `layer:icp:${normalizePart(hash)}`
  }
}