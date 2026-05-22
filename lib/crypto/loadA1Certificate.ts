import fs from "fs";

export type A1CertificateInfo = {
  subject: string
  issuer: string
  serialNumber: string
  fingerprintSha256: string
  validFrom: string
  validTo: string
  daysRemaining: number
}

export type A1Certificate = {
  pfxBuffer: Buffer
  passphrase: string
  mode: "REAL" | "MOCK"
  privateKey: unknown
  cert: { publicKey: unknown } | null
  info: A1CertificateInfo
}

export function loadA1Certificate(): A1Certificate {
  const certPath = process.env.A1_CERT_PATH;
  const certPassword = process.env.A1_CERT_PASSWORD;

  if (!certPath || !certPassword) {
    throw new Error("Certificado A1 não configurado");
  }

  const pfxBuffer = fs.readFileSync(certPath);

  return {
    pfxBuffer,
    passphrase: certPassword,
    mode: "REAL",
    privateKey: null,
    cert: null,
    info: {
      subject: "",
      issuer: "",
      serialNumber: "",
      fingerprintSha256: "",
      validFrom: "",
      validTo: "",
      daysRemaining: 0,
    },
  };
}

export const loadA1CertificateFromEnv = loadA1Certificate