declare module "rfc3161" {
  export function createRequest(options: Record<string, unknown>): Buffer
  export function verifyResponse(buf: Buffer, options: Record<string, unknown>): boolean
  export const timestamp: {
    (options: Record<string, unknown>): Promise<Buffer>
    createRequest(options: Record<string, unknown>): Buffer
    verifyResponse(buf: Buffer, options: Record<string, unknown>): boolean
  }
}
