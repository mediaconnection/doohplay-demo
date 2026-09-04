// scripts/regenerate-public-key.js
//
// Achado em 03/09/2026 (STATUS_PROJETO.md, investigação da assinatura de
// PDF): este script rodava automaticamente como "Pre-Deploy Command" do
// Render em TODO deploy, mas a escrita em keys/public.pem NUNCA chegava
// na instância real que serve tráfego -- confirmado comparando o hash do
// arquivo lido em produção com o hash do arquivo commitado no git: eram
// sempre idênticos, deploy após deploy, apesar do script logar sucesso
// toda vez. Causa exata não totalmente esclarecida (Render provavelmente
// roda o Pre-Deploy Command num contexto de filesystem separado da
// instância que sobe depois), mas o efeito prático é claro: a automação
// nunca funcionou, só dava a falsa impressão de que funcionava.
//
// Reescrito pra ser um utilitário MANUAL -- rode isto localmente sempre
// que PRIVATE_PEM (a chave privada real usada por signHash(), ver
// src/services/pdf/pdfSigner.ts) for rotacionada, revise o diff de
// keys/public.pem, e commite. NÃO está mais configurado como Pre-Deploy
// Command no Render (removido do painel manualmente) -- rodar automático
// nunca teve efeito real e só confundia.
//
// Uso: PRIVATE_PEM="$(cat sua-chave.pem)" node scripts/regenerate-public-key.js

const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const privRaw = process.env.PRIVATE_PEM?.trim()

if (!privRaw) {
  console.error("PRIVATE_PEM não está definida no ambiente. Defina antes de rodar:")
  console.error('  PRIVATE_PEM="$(cat sua-chave-privada.pem)" node scripts/regenerate-public-key.js')
  process.exit(1)
}

const priv = privRaw.startsWith("-----")
  ? privRaw
  : "-----BEGIN PRIVATE KEY-----\n" + privRaw.match(/.{1,64}/g).join("\n") + "\n-----END PRIVATE KEY-----\n"

const pub = crypto.createPublicKey(priv).export({ type: "spki", format: "pem" }).toString()

const targetPath = path.resolve(__dirname, "..", "keys", "public.pem")
fs.writeFileSync(targetPath, pub)

console.log("keys/public.pem atualizada a partir de PRIVATE_PEM.")
console.log("Revise o diff (git diff keys/public.pem) e commite se estiver correto.")
