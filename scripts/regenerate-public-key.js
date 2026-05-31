const crypto = require('crypto')
const fs = require('fs')
const privRaw = process.env.PRIVATE_PEM
if (privRaw) {
  const priv = privRaw.startsWith('-----') ? privRaw : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n'
  const pub = crypto.createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString()
  fs.writeFileSync('keys/public.pem', pub)
  console.log('[startup] public.pem regenerado do PRIVATE_PEM')
}
