import crypto from "crypto";

export function sha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function buildHashes(files: Record<string, Buffer>) {
  const result: Record<string, string> = {};

  for (const [name, buffer] of Object.entries(files)) {
    result[name] = sha256(buffer);
  }

  return result;
}