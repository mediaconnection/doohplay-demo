const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const LOG_FILE = path.join(ROOT, "logs", "assinaturas.log");
const CHAIN_FILE = path.join(ROOT, "logs", "proofchain.json");

if (!fs.existsSync(LOG_FILE)) {
  console.error("❌ Log de assinaturas não encontrado");
  process.exit(1);
}

const linhas = fs.readFileSync(LOG_FILE, "utf8")
  .split("\n")
  .filter(Boolean);

let chain = {
  sistema: "DOOHPLAY",
  algoritmo: "SHA256",
  blocos: []
};

if (fs.existsSync(CHAIN_FILE)) {
  chain = JSON.parse(fs.readFileSync(CHAIN_FILE));
}

let lastHash =
  chain.blocos.length === 0
    ? "GENESIS"
    : chain.blocos[chain.blocos.length - 1].hash_bloco;

let index = chain.blocos.length + 1;

for (const linha of linhas.slice(chain.blocos.length)) {

  const [timestamp, arquivo, hash] = linha.split(" | ");

  const docHash = hash.replace("SHA256=", "");

  const blockData = index + timestamp + arquivo + docHash + lastHash;

  const blockHash = crypto
    .createHash("sha256")
    .update(blockData)
    .digest("hex");

  const bloco = {
    index,
    timestamp,
    arquivo,
    hash_documento: docHash,
    hash_anterior: lastHash,
    hash_bloco: blockHash
  };

  chain.blocos.push(bloco);

  lastHash = blockHash;
  index++;
}

fs.writeFileSync(CHAIN_FILE, JSON.stringify(chain, null, 2));

console.log("✅ ProofChain atualizada");
console.log(`🔗 Blocos totais: ${chain.blocos.length}`);