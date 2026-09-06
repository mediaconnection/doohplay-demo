import { execFile } from "child_process";

export async function validateCertChain(
  certPath: string
): Promise<{
  valid: boolean;
  chain?: string[];
  error?: string;
}> {
  return new Promise((resolve) => {
    execFile(
      "openssl",
      [
        "verify",
        "-purpose",
        "any",
        "-trusted_first",
        certPath,
      ],
      (error, stdout) => {
        if (error) {
          return resolve({
            valid: false,
            error: error.message,
          });
        }

        resolve({
          valid: stdout.includes(": OK"),
          chain: stdout
            .split("\n")
            .filter((l) => l.includes("depth=")),
        });
      }
    );
  });
}