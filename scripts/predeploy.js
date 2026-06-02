const crypto = require('crypto')
const fs = require('fs')
const { execSync } = require('child_process')

// 1. Regenerar chave pública do PRIVATE_PEM
const privRaw = process.env.PRIVATE_PEM
if (privRaw) {
  const priv = privRaw.startsWith('-----') ? privRaw
    : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n'
  const pub = crypto.createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString()
  const paths = ['keys/public.pem', '.next/standalone/keys/public.pem']
  for (const p of paths) {
    try { fs.writeFileSync(p, pub); console.log('[startup] updated:', p) } catch(e) { console.warn('[startup] skip:', p) }
  }
}

// 2. Copiar server chunks para standalone após build
try {
  execSync('cp -r .next/server .next/standalone/.next/server', { stdio: 'inherit' })
  console.log('[startup] server chunks copied to standalone')
} catch(e) {
  console.warn('[startup] copy skipped:', e.message)
}
