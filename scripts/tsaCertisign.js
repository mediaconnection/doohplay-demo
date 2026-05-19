require("dotenv").config();

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const alvo = process.argv[2]; // ex: assinatura.p7s
if (!alvo) {
  console.error("Uso: node tsaCertisign.js assinatura.p7s");
  process.exit(1);
}

const TSA_URL = process.env.TSA_URL;
const TSA_USER = process.env.TSA_USER;
const TSA_PASS = process.env.TSA_PASS;

if (!TSA_URL || !TSA_USER || !TSA_PASS) {
  console.error("Variáveis TSA_URL / TSA_USER / TSA_PASS ausentes");
  process.exit(1);
}

if (!fs.existsSync(alvo)) {
  console.error("Arquivo não encontrado:", alvo);
  process.exit(1);
}

const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const reqDer = path.join(tmpDir, "tsa-req.der");
const tstDer = "timestamp.tst";

(async () => {
  try {
    // 1️⃣ Criar TimeStampReq (RFC 3161)
    execFileSync("openssl", [
      "ts", "-query",
      "-data", alvo,
      "-sha256",
      "-cert",
      "-out", reqDer
    ], { stdio: "inherit" });

    // 2️⃣ Enviar para TSA Certisign via HTTP
    const reqData = fs.readFileSync(reqDer);

    const response = await axios.post(
      TSA_URL,
      reqData,
      {
        headers: {
          "Content-Type": "application/timestamp-query"
        },
        auth: {
          username: TSA_USER,
          password: TSA_PASS
        },
        responseType: "arraybuffer",
        timeout: 20000
      }
    );

    fs.writeFileSync(tstDer, Buffer.from(response.data));
    console.log("✅ TSA recebido com sucesso:", tstDer);

  } catch (err) {
    console.error("❌ Erro ao solicitar TSA:", err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (fs.existsSync(reqDer)) fs.unlinkSync(reqDer);
  }
})();
