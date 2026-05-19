const fs = require("fs");
const forge = require("node-forge");

function carregarCertificadoA1() {
  const caminho = process.env.A1_PFX_PATH;
  let senha = process.env.A1_PFX_PASSWORD;

  if (!caminho || !senha) {
    throw new Error("Variáveis A1_PFX_PATH ou A1_PFX_PASSWORD ausentes");
  }

  // 🔐 Normalização crítica da senha
  senha = String(senha)
    .trim()
    .normalize("NFKC");

  if (!fs.existsSync(caminho)) {
    throw new Error(`Arquivo PFX não encontrado: ${caminho}`);
  }

  const pfxBuffer = fs.readFileSync(caminho);

  // ✅ Conversão segura para ASN.1
  const pfxDer = forge.util.createBuffer(pfxBuffer.toString("binary"));
  const pfxAsn1 = forge.asn1.fromDer(pfxDer);

  let pfx;
  try {
    pfx = forge.pkcs12.pkcs12FromAsn1(
      pfxAsn1,
      false,
      senha
    );
  } catch (err) {
    throw new Error(
      "Falha ao abrir o PFX. Senha incorreta ou encoding inválido."
    );
  }

  // 🔑 Chave privada
  const keyBags = pfx.getBags({
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
  })[forge.pki.oids.pkcs8ShroudedKeyBag];

  if (!keyBags || !keyBags.length) {
    throw new Error("Chave privada não encontrada no PFX");
  }

  // 📜 Certificado
  const certBags = pfx.getBags({
    bagType: forge.pki.oids.certBag
  })[forge.pki.oids.certBag];

  if (!certBags || !certBags.length) {
    throw new Error("Certificado não encontrado no PFX");
  }

  return {
    privateKey: keyBags[0].key,
    certificate: certBags[0].cert
  };
}

module.exports = { carregarCertificadoA1 };
