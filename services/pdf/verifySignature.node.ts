import crypto from "crypto";
import fs from "fs";
import path from "path";

const publicKeyPath = path.resolve(
  process.cwd(),
  "keys/public.pem"
);

// Achado em 03/09/2026 (STATUS_PROJETO.md): esta é uma cópia duplicada de
// src/services/pdf/verifySignature.node.ts, inalcançável via o alias
// @/services/pdf/... (resolve pra src/services/pdf/ conforme
// next.config.ts) -- mas corrigida aqui também por segurança, pra eliminar
// qualquer ambiguidade sobre qual cópia está de fato em uso. Dois bugs
// que a versão em src/ já não tinha: (1) verify.update(hash) sem decodificar
// hex -- teria que ser Buffer.from(hash, "hex"), igual ao que signHash()
// assina; (2) string PEM crua em vez de KeyObject pré-parseado (achado
// mais fundo desta mesma investigação -- crypto.createVerify().verify()
// com string crua produz resultado incorreto neste ambiente).
const publicKeyPem = fs.readFileSync(publicKeyPath, "utf8");
const publicKey = crypto.createPublicKey(publicKeyPem);

export function verifySignature(
  hash: string,
  signature: string
): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(Buffer.from(hash, "hex"));
  verify.end();

  return verify.verify(publicKey, signature, "base64");
}
