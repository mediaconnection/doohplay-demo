/**
 * gerar-com-ia.js
 * -----------------
 * Versão do gerador que usa IA (Gemini 3.1 Flash Image) pra criar a foto
 * de fundo de cada peça, em vez de depender de uma URL de imagem pronta
 * em pecas.json.
 *
 * Fluxo: pecas.json (prompt) → Gemini gera a foto → Puppeteer compõe
 * headline/subline/CTA por cima (mesmo template.html) → PNG final.
 *
 * Requer:
 *   npm install puppeteer @google/genai
 *   export GEMINI_API_KEY=...   (gerar em aistudio.google.com/apikey)
 *
 * Uso:
 *   node gerar-com-ia.js
 *
 * ⚠️ DUPLICAÇÃO INTENCIONAL, DOCUMENTADA: a chamada à API do Gemini aqui
 * é uma cópia simplificada de `lib/imageGeneration.ts` (não um import),
 * porque este é um script standalone (roda com `node` puro, sem o build
 * do Next/TS). Se o modelo, o prompt-base ("no text, no watermark...")
 * ou o timeout mudarem em `lib/imageGeneration.ts`, atualizar aqui
 * também. Isso é exatamente o padrão "duas implementações divergem
 * silenciosamente" documentado no projeto (ver PROJETO_DOOHPLAY.md,
 * seção 5) — mantido de propósito só porque um script solo não vale o
 * custo de um pipeline de build separado, mas fica registrado pra não
 * virar bug esquecido.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { GoogleGenAI } = require('@google/genai');

const PECAS_PATH = path.join(__dirname, 'pecas.json');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const OUT_DIR = path.join(__dirname, 'saida');
const TMP_IMG_DIR = path.join(__dirname, 'saida', '_fotos-geradas');

const MODEL = 'gemini-3.1-flash-image';
const TIMEOUT_MS = 30_000;

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function gerarFoto(ai, prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: 'user',
        parts: [{ text: `${prompt.trim()}. Photographic, no text, no watermark, no logo.` }],
      }],
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(p => p.inlineData?.data);
    if (!imagePart) {
      throw new Error('API não retornou imagem (possível bloqueio de safety filter)');
    }
    return Buffer.from(imagePart.inlineData.data, 'base64');
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Faltando GEMINI_API_KEY. Gere em https://aistudio.google.com/apikey');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(TMP_IMG_DIR)) fs.mkdirSync(TMP_IMG_DIR, { recursive: true });

  const pecas = JSON.parse(fs.readFileSync(PECAS_PATH, 'utf8'));
  const templateBase = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const ai = new GoogleGenAI({ apiKey });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log(`Gerando ${pecas.length} peças (foto por IA + composição)...\n`);

  for (const peca of pecas) {
    const prompt = peca._prompt_original || peca.imagem;
    if (!prompt || prompt.startsWith('COLOQUE_')) {
      console.log(`⏭️  ${peca.id}: sem prompt de imagem, pulando`);
      continue;
    }

    try {
      console.log(`🎨 ${peca.id}: gerando foto...`);
      const fotoBuffer = await gerarFoto(ai, prompt);

      const fotoPath = path.join(TMP_IMG_DIR, `${peca.id}.png`);
      fs.writeFileSync(fotoPath, fotoBuffer);

      const html = templateBase
        .replaceAll('__IMAGE_URL__', `file://${fotoPath}`)
        .replaceAll('__CHANNEL_COLOR__', peca.cor || '#2563EB')
        .replaceAll('__CHANNEL_NAME__', escapeHtml(peca.canal || ''))
        .replaceAll('__HEADLINE__', escapeHtml(peca.headline || ''))
        .replaceAll('__SUBLINE__', escapeHtml(peca.subline || ''))
        .replaceAll('__CTA__', escapeHtml(peca.cta || ''));

      await page.setContent(html, { waitUntil: 'networkidle0' });
      const outPath = path.join(OUT_DIR, `${peca.id}.png`);
      await page.screenshot({ path: outPath, type: 'png' });

      console.log(`✅ ${peca.id}.png`);
    } catch (err) {
      console.error(`❌ ${peca.id}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nPronto! Peças finais em ./saida/, fotos originais em ./saida/_fotos-geradas/`);
}

main().catch(err => {
  console.error('Erro geral:', err);
  process.exit(1);
});
