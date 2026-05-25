// @ts-nocheck
import { verifyEventHash } from "./ledgerVerify";

export function verifyEvent(event: any) {

  return {
    hash_valid: verifyEventHash(event)
  };

}
