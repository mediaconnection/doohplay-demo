const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "..", "logs", "assinaturas.log");
const CHAIN_FILE = path.join(__dirname, "..", "logs", "proofchain.json");

function verificar(hash) {

  const log = fs.readFileSync(LOG_FILE, "utf8").split("\n");

  const registro = log.find(l => l.includes(hash));

  if (!registro) {
    return { valid: false };
  }

  const chain = JSON.parse(fs.readFileSync(CHAIN_FILE));

  const bloco = chain.find(b => b.hash === hash);

  return {
    valid: true,
    hash,
    log: registro,
    block: bloco
  };
}

module.exports = { verificar };