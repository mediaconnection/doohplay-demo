// @ts-nocheck
import crypto from "crypto";

export function signEvent(
  payload: string,
  privateKey: string
) {

  const signer = crypto.createSign("SHA256");

  signer.update(payload);

  return signer.sign(privateKey, "base64");

}
