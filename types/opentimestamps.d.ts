declare module "opentimestamps" {
  export function stamp(data: Buffer): Promise<Buffer>
  export function verify(data: Buffer, ots: Buffer): Promise<boolean>
}
