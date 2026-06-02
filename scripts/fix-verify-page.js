const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'app', 'verify', '[hash]', 'page.tsx')
const current = fs.readFileSync(target, 'utf8')

if (current.split('\n').length < 100) {
  console.log('[fix] page.tsx has', current.split('\n').length, 'lines — needs fix')
  // Copy from the correct source
  const correct = path.join(__dirname, '..', 'verify', '[hash]', 'page.tsx')
  if (fs.existsSync(correct)) {
    const src = fs.readFileSync(correct, 'utf8')
    if (src.split('\n').length > 100) {
      fs.writeFileSync(target, src)
      console.log('[fix] Copied from verify/[hash]/page.tsx:', src.split('\n').length, 'lines')
    }
  }
} else {
  console.log('[fix] page.tsx OK:', current.split('\n').length, 'lines')
}

// Remove duplicate pages
const dupes = [
  path.join(__dirname, '..', 'verify', '[hash]', 'page.tsx'),
  path.join(__dirname, '..', 'src', 'app', 'verify', '[hash]', 'page.tsx'),
]
for (const d of dupes) {
  if (fs.existsSync(d)) {
    fs.unlinkSync(d)
    console.log('[fix] Removed duplicate:', d)
  }
}
