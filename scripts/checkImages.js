// scripts/checkImages.js
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/checkImages.js <arquivo.pdf>');
  process.exit(1);
}

const buf = fs.readFileSync(file);
console.log('Arquivo:', file);
console.log('Tamanho (bytes):', buf.length);

// procura assinaturas de imagens comuns
const pngSig = Buffer.from([0x89,0x50,0x4E,0x47]); // \x89PNG
const jpgSig1 = Buffer.from([0xFF,0xD8,0xFF,0xE0]);
const jpgSig2 = Buffer.from([0xFF,0xD8,0xFF,0xE1]);

function countSig(sig){
  let i = 0;
  let pos = 0;
  while (true) {
    pos = buf.indexOf(sig, pos);
    if (pos === -1) break;
    i++;
    pos += 1;
  }
  return i;
}

const pngCount = countSig(pngSig);
const jpgCount = countSig(jpgSig1) + countSig(jpgSig2);

console.log('PNG occurrences:', pngCount);
console.log('JPEG occurrences:', jpgCount);

// procura objetos XObject /Subtype /Image (texto bruto)
const text = buf.toString('latin1');
const xobjMatches = (text.match(/\/Subtype\s*\/Image/g) || []).length;
const xobjectMatches = (text.match(/\/XObject/g) || []).length;
console.log('/Subtype /Image matches:', xobjMatches);
console.log('/XObject matches:', xobjectMatches);

// procura por 'logo' (nome de recurso)
const logoNameMatches = (text.match(/logo/gi) || []).length;
console.log("'logo' token occurrences:", logoNameMatches);
