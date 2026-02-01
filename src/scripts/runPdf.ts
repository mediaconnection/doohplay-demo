import { execFile } from "child_process";
import path from "path";
import os from "os";
import fs from "fs";

export function runPdfWorker(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `pdf-${Date.now()}.pdf`);
    const script = path.resolve("scripts/pdf-generate.tsx");

    execFile(
      "node",
      [
        "--loader",
        "ts-node/esm",
        script,
        JSON.stringify(data),
        tmpFile,
      ],
      (err) => {
        if (err) return reject(err);
        const buffer = fs.readFileSync(tmpFile);
        fs.unlinkSync(tmpFile);
        resolve(buffer);
      }
    );
  });
}
