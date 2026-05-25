// @ts-nocheck
import { spawn } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import os from "os";
import path from "path";

interface TSAResult {
  token: string;
  time: Date;
}

export async function requestTSATimestamp(hash: string): Promise<TSAResult> {

  return new Promise((resolve, reject) => {

    const id = randomUUID();

    const tmp = os.tmpdir();

    const inputFile = path.join(tmp, `${id}.txt`);
    const queryFile = path.join(tmp, `${id}.tsq`);
    const responseFile = path.join(tmp, `${id}.tsr`);

    try {

      // salvar hash
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

      query.on("error", reject);

      query.on("close", code => {

        if (code !== 0) {
          return reject(new Error("failed to generate TSA query"));
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

        curl.on("error", reject);

        curl.on("close", code => {

          if (code !== 0) {
            return reject(new Error("failed to request TSA"));
          }

          try {

            const token = readFileSync(responseFile).toString("base64");

            resolve({
              token,
              time: new Date()
            });

          } finally {

            // limpar arquivos
            try {
              if (existsSync(inputFile)) unlinkSync(inputFile);
              if (existsSync(queryFile)) unlinkSync(queryFile);
              if (existsSync(responseFile)) unlinkSync(responseFile);
            } catch {}

          }

        });

      });

    } catch (err) {
      reject(err);
    }

  });

}
