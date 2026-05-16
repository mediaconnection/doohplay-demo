declare module "rfc3161" {
  export function createRequest(options: Record<string, unknown>): Buffer
  export function verifyResponse(buf: Buffer, options: Record<string, unknown>): boolean
  export const timestamp: {
    createRequest(options: Record<string, unknown>): Buffer
    verifyResponse(buf: Buffer, options: Record<string, unknown>): boolean
  }
}
