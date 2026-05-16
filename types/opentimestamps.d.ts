declare module "opentimestamps" {
  export function stamp(data: Buffer): Promise<Buffer>
  export function verify(data: Buffer, ots: Buffer): Promise<boolean>
  export class DetachedTimestampFile {
    static fromHash(hashOp: unknown, hash: Buffer): DetachedTimestampFile
    static fromBytes(bytes: Buffer | Uint8Array): DetachedTimestampFile
    static deserialize(ctx: unknown): DetachedTimestampFile
    serializeToBytes(): Uint8Array
  }
}
