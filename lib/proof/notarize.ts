import { spawn } from "child_process";

export async function notarizeHash(hash: string) {

  return new Promise((resolve, reject) => {

    const process = spawn("ots", ["stamp", hash]);

    process.on("close", code => {
      if (code === 0) resolve(true);
      else reject(false);
    });

  });

}