export function createCanonicalEvent(input: any) {
  return {
    ...input,
    created_at: new Date().toISOString()
  }
}
