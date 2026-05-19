import { spawn } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";

interface TSAResult {
  token: string;
  time: Date;
}

export async function requestTSATimestamp(
  hash: string
): Promise<TSAResult> {

  return new Promise((resolve, reject) => {

    const id = randomUUID();

    const inputFile = `/tmp/${id}.txt`;
    const queryFile = `/tmp/${id}.tsq`;
    const responseFile = `/tmp/${id}.tsr`;

    let stderr = "";

    const cleanup = () => {
      try { unlinkSync(inputFile); } catch {}
      try { unlinkSync(queryFile); } catch {}
      try { unlinkSync(responseFile); } catch {}
    };

    try {

      writeFileSync(inputFile, hash);

      const query = spawn("openssl", [
        "ts",
        "-query",
        "-data",
        inputFile,
        "-sha256",
        "-no_nonce",
        "-cert",
        "-out",
        queryFile
      ]);

      query.stderr.on("data", d => {
        stderr += d.toString();
      });

      query.on("error", err => {
        cleanup();
        reject(err);
      });

      query.on("close", code => {

        if (code !== 0) {
          cleanup();
          return reject(
            new Error(`TSA query failed: ${stderr}`)
          );
        }

        const curl = spawn("curl", [
          "-H",
          "Content-Type: application/timestamp-query",
          "--data-binary",
          `@${queryFile}`,
          "https://freetsa.org/tsr",
          "-o",
          responseFile
        ]);

        curl.stderr.on("data", d => {
          stderr += d.toString();
        });

        curl.on("error", err => {
          cleanup();
          reject(err);
        });

        curl.on("close", code => {

          if (code !== 0) {
            cleanup();
            return reject(
              new Error(`TSA request failed: ${stderr}`)
            );
          }

          try {

            const tokenBuffer = readFileSync(responseFile);

            resolve({
              token: tokenBuffer.toString("base64"),
              time: new Date()
            });

          } catch (err) {
            reject(err);
          } finally {
            cleanup();
          }

        });

      });

    } catch (err) {
      cleanup();
      reject(err);
    }

  });

}