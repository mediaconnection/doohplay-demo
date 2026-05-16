declare module "opentimestamps" {
  export function stamp(data: Buffer): Promise<Buffer>
  export function verify(data: Buffer, ots: Buffer): Promise<boolean>
  export class DetachedTimestampFile {
    static fromHash(hashOp: unknown, hash: Buffer): DetachedTimestampFile
    static deserialize(ctx: unknown): DetachedTimestampFile
    serializeToBytes(): Uint8Array
  }
}
