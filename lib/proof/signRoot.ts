import crypto from "crypto";

export function signRoot(
  root: string,
  privateKey: string
) {

  const signer = crypto.createSign("SHA256");

  signer.update(root);

  return signer.sign(privateKey, "base64");

}