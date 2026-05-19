import crypto from "crypto";
import { canonicalize } from "./canonicalJson";

export function sha256FromObject(obj: any): string {
  const canonical = canonicalize(obj);

  return crypto
    .createHash("sha256")
    .update(canonical, "utf8")
    .digest("hex");
}