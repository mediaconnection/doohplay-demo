import { execFile } from "child_process";

export async function validateRevocation(
  certPath: string,
  issuerCertPath: string
): Promise<{
  valid: boolean;
  method: "OCSP" | "CRL";
  error?: string;
}> {
  return new Promise((resolve) => {
    execFile(
      "openssl",
      [
        "ocsp",
        "-issuer",
        issuerCertPath,
        "-cert",
        certPath,
        "-noverify",
        "-text",
      ],
      (error, stdout) => {
        if (error) {
          return resolve({
            valid: false,
            method: "OCSP",
            error: error.message,
          });
        }

        const good = stdout.includes("Cert Status: good");

        resolve({
          valid: good,
          method: "OCSP",
        });
      }
    );
  });
}