import fs from "fs";

export function loadA1Certificate() {
  const certPath = process.env.A1_CERT_PATH;
  const certPassword = process.env.A1_CERT_PASSWORD;

  if (!certPath || !certPassword) {
    throw new Error("Certificado A1 não configurado");
  }

  const pfxBuffer = fs.readFileSync(certPath);

  return {
    pfxBuffer,
    passphrase: certPassword,
  };
}

export const loadA1CertificateFromEnv = loadA1Certificate