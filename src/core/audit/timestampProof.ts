// @ts-nocheck
import * as ots from "opentimestamps";

export async function timestampMerkleRoot(merkleRoot: string) {

  const bytes = Buffer.from(merkleRoot, "hex");

  const detached = ots.DetachedTimestampFile.fromBytes(bytes);

  await ots.stamp(detached as unknown as Buffer);

  const proof = detached.serializeToBytes();

  return {
    merkle_root: merkleRoot,
    ots_proof: Buffer.from(proof).toString("base64"),
    timestamped_at: new Date().toISOString()
  };

}
