import crypto from "crypto";
import fs from "fs";
import path from "path";

const publicKeyPath = path.resolve(
  process.cwd(),
  "keys/public.pem"
);

const publicKey = fs.readFileSync(publicKeyPath, "utf8");

export function verifySignature(
  hash: string,
  signature: string
): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(hash);
  verify.end();

  return verify.verify(publicKey, signature, "base64");
}
