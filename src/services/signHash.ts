import fs from "fs";
import forge from "node-forge";

type SignedHashResult = {
  signedHash: string;
  certificateSerial: string;
  certificateAuthority: string;
};

export function signHash(contentHashHex: string): SignedHashResult {
  const pfxPath = process.env.CERT_PFX_PATH;
  const password = process.env.CERT_PFX_PASSWORD;

  if (!pfxPath || !password) {
    throw new Error("CERT_PFX_PATH ou CERT_PFX_PASSWORD não configurados");
  }

  // 📦 leitura segura (BUFFER)
  const pfxBuffer = fs.readFileSync(pfxPath);

  let p12;
  try {
    const p12Asn1 = forge.asn1.fromDer(
      forge.util.createBuffer(pfxBuffer.toString("binary"))
    );

    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  } catch (err) {
    throw new Error("Falha ao carregar certificado A1 (.pfx)");
  }

  // 🔑 chave privada
  const keyBags = p12.getBags({
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
  });

  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
  if (!keyBag?.key) {
    throw new Error("Chave privada não encontrada no certificado");
  }

  const privateKey = keyBag.key;

  // 📜 certificado
  const certBags = p12.getBags({
    bagType: forge.pki.oids.certBag,
  });

  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  if (!certBag?.cert) {
    throw new Error("Certificado não encontrado no PFX");
  }

  const certificate = certBag.cert;

  /* =========================
     ✅ ASSINATURA CORRETA
     (ASSINA O HASH BINÁRIO)
  ========================= */

  const hashBytes = forge.util.hexToBytes(contentHashHex);

  const signatureBinary = privateKey.sign({
    digestAlgorithm: forge.pki.oids.sha256,
  }, hashBytes);

  const signedHash = forge.util.encode64(signatureBinary);

  /* =========================
     📇 METADADOS
  ========================= */

  const certificateSerial = certificate.serialNumber;

  const certificateAuthority = certificate.issuer.attributes
    .map((a) => `${a.shortName || a.name}=${a.value}`)
    .join(", ");

  return {
    signedHash,
    certificateSerial,
    certificateAuthority,
  };
}

export const assinarComA1 = signHash