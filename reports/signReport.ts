import { exec } from "child_process";
import path from "path";

export function signReport(): Promise<string> {

  return new Promise((resolve, reject) => {

    const jarPath = path.resolve(
      __dirname,
      "../signer/pdf-signer-1.0-jar-with-dependencies.jar"
    );

    const command = `java -jar "${jarPath}"`;

    console.log("Iniciando assinatura ICP-Brasil...");
    console.log(command);

    exec(command, (error, stdout, stderr) => {

      if (error) {
        console.error("Erro ao executar o assinador:");
        console.error(stderr);
        reject(error);
        return;
      }

      if (stderr) {
        console.warn("Aviso do assinador:");
        console.warn(stderr);
      }

      console.log("Assinatura concluída.");

      resolve(stdout);

    });

  });

}