import { createHash } from "crypto";
import stringify from "json-stable-stringify";
import type { CanonicalEvent } from "./createEvent";

export function gerarHashEvento(evento: CanonicalEvent): string {
  const canonical = stringify(evento);

  if (typeof canonical !== "string") {
    throw new Error("Falha ao canonicalizar o evento");
  }

  return createHash("sha256").update(canonical).digest("hex");
}
