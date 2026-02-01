import crypto from "crypto";
import fs from "fs";

const privateKey = fs.readFileSync("keys/private.pem", "utf8");

export function signHash(hash: string): string {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(hash);
  sign.end();

  return sign.sign(privateKey, "base64");
}
