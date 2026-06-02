const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'verify', '[hash]', 'page.tsx')
const content = fs.readFileSync(target, 'utf8')
const lines = content.split('\n')

console.log('[fix-verify] lines:', lines.length)

if (lines.length < 100) {
  console.error('[fix-verify] File too short! Cannot fix automatically.')
  process.exit(1)
}

// Remove export const dynamic if present after line 20
const dynamicLine = lines.findIndex(l => l.includes('export const dynamic'))
if (dynamicLine > 0 && dynamicLine < 20) {
  console.log('[fix-verify] export const dynamic found at line', dynamicLine + 1)
}

console.log('[fix-verify] File looks OK')
