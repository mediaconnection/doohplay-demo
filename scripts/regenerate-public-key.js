const crypto = require('crypto')
const fs = require('fs')
const privRaw = process.env.PRIVATE_PEM
if (privRaw) {
  const priv = privRaw.startsWith('-----') ? privRaw : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n'
  const pub = crypto.createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString()
  const paths = ['keys/public.pem', '.next/standalone/keys/public.pem']
  for (const p of paths) {
    try { fs.writeFileSync(p, pub); console.log('[startup] updated:', p) } catch(e) { console.warn('[startup] skip:', p) }
  }
}
