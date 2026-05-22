import { execFile } from "child_process";

export async function validateTsaToken(
  tsaPath: string
): Promise<{
  valid: boolean;
  provider?: string;
  timestamp?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    execFile(
      "openssl",
      ["ts", "-reply", "-in", tsaPath, "-text"],
      (error, stdout) => {
        if (error) {
          return resolve({
            valid: false,
            error: error.message,
          });
        }

        resolve({
          valid: stdout.includes("Status: Granted"),
          provider: extract(stdout, "TSA"),
          timestamp: extract(stdout, "Time stamp"),
        });
      }
    );
  });
}

function extract(text: string, label: string) {
  const line = text
    .split("\n")
    .find((l) => l.includes(label));
  return line?.split(":").slice(1).join(":").trim();
}