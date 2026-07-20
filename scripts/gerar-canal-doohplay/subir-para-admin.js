/**
 * subir-para-admin.js
 * ---------------------
 * Sobe as 10 peças geradas (./saida/*.png) pro DOOHPLAY de verdade, via a
 * rota já existente e testada em produção: POST /api/admin/institutional-media.
 *
 * Por que reusar a rota em vez de escrever direto no banco/R2:
 * - Reaproveita toda a lógica já validada (upload R2, validação de
 *   imagem/vídeo, sincronização com a fundação unificada via
 *   syncInstitutionalToUnified) — escrever direto no banco arriscaria
 *   esquecer algum passo e cair no mesmo padrão de bug "duas
 *   implementações divergem" (ver PROJETO_DOOHPLAY.md, seção 5).
 *
 * Requer:
 *   ADMIN_SECRET       — já configurado no Render (autenticação da rota)
 *   API_BASE_URL       — opcional, default https://doohplay.com.br
 *
 * Uso:
 *   node subir-para-admin.js
 *   node subir-para-admin.js --inicio 2026-07-20 --fim 2027-07-20
 */

const fs = require('fs');
const path = require('path');

const PECAS_PATH = path.join(__dirname, 'pecas.json');
const SAIDA_DIR = path.join(__dirname, 'saida');

const BASE_URL = process.env.API_BASE_URL || 'https://doohplay.com.br';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Duração de exibição de cada peça institucional, em segundos.
const DURATION_SECONDS = 15;

// Janela de veiculação padrão: hoje até +365 dias, se não passado por
// argumento --inicio/--fim. start_date/end_date são OBRIGATÓRIOS na rota.
function parseArgDate(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
const hoje = new Date();
const daquiUmAno = new Date(hoje);
daquiUmAno.setDate(daquiUmAno.getDate() + 365);

const START_DATE = parseArgDate('--inicio', isoDate(hoje));
const END_DATE = parseArgDate('--fim', isoDate(daquiUmAno));

// Mapeia o nome de canal usado em pecas.json pro nome real do segmento
// em inventory_segments_v2 (podem divergir levemente — a planilha
// comercial usou "Fitness & Bem-estar" e "Varejo & Pet" combinados,
// enquanto os 10 canais reais do sistema são mais granulares, ver
// PROJETO_DOOHPLAY.md seção 6, Fase 15). Ajuste aqui se os nomes reais
// no seu banco forem diferentes — o script avisa se não encontrar
// correspondência, nunca assume errado silenciosamente.
const MAPA_CANAL_PARA_SEGMENTO = {
  'Beleza & Estética': 'Beleza & Estética',
  'Saúde': 'Saúde',
  'Alimentação': 'Alimentação',
  'Fitness & Bem-estar': 'Fitness & Esportes',
  // As duas peças "varejo-pet" vêm de canais reais diferentes —
  // resolvido por id específico abaixo, não pelo campo `canal` genérico.
};
const MAPA_POR_ID = {
  'varejo-pet-1': 'Pet & Animais',   // peça de banho/grooming
  'varejo-pet-2': 'Varejo & Mercado', // peça de lista de compras
};

function normalizar(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase().trim();
}

async function buscarSegmentos() {
  const url = `${BASE_URL}/api/admin/institutional-media?secret=${encodeURIComponent(ADMIN_SECRET)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET institutional-media falhou: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.segments || [];
}

function encontrarSegmentId(nomeDesejado, segmentos) {
  const alvo = normalizar(nomeDesejado);
  const exato = segmentos.find(s => normalizar(s.name) === alvo);
  if (exato) return exato.id;
  // fallback: correspondência parcial (ex: "Fitness" dentro de "Fitness & Esportes")
  const parcial = segmentos.find(s => normalizar(s.name).includes(alvo) || alvo.includes(normalizar(s.name)));
  return parcial ? parcial.id : null;
}

async function subirPeca(peca, segmentId) {
  const filePath = path.join(SAIDA_DIR, `${peca.id}.png`);
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: `arquivo não encontrado: ${filePath} (rodou o gerar-com-ia.js antes?)` };
  }

  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/png' });

  const form = new FormData();
  form.append('file', blob, `${peca.id}.png`);
  form.append('name', `Canal DOOHPLAY — ${peca.headline}`);
  form.append('duration', String(DURATION_SECONDS));
  form.append('start_date', START_DATE);
  form.append('end_date', END_DATE);
  form.append('display_format', 'fullscreen');
  if (segmentId) form.append('segment_id', segmentId);

  const url = `${BASE_URL}/api/admin/institutional-media?secret=${encodeURIComponent(ADMIN_SECRET)}`;
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data.error || `HTTP ${res.status}` };
  }
  return { ok: true, id: data.id, url: data.url };
}

async function main() {
  if (!ADMIN_SECRET) {
    console.error('❌ Faltando ADMIN_SECRET no ambiente (já deveria existir no Render).');
    process.exit(1);
  }

  console.log(`Base: ${BASE_URL}`);
  console.log(`Janela de veiculação: ${START_DATE} até ${END_DATE}\n`);

  console.log('Buscando segmentos reais do Canal DOOHPLAY...');
  const segmentos = await buscarSegmentos();
  console.log(`  ${segmentos.length} segmentos encontrados: ${segmentos.map(s => s.name).join(', ')}\n`);

  const pecas = JSON.parse(fs.readFileSync(PECAS_PATH, 'utf8'));

  for (const peca of pecas) {
    const nomeAlvo = MAPA_POR_ID[peca.id] || MAPA_CANAL_PARA_SEGMENTO[peca.canal] || peca.canal;
    const segmentId = encontrarSegmentId(nomeAlvo, segmentos);

    if (!segmentId) {
      console.warn(`⚠️  ${peca.id}: não encontrei o segmento "${nomeAlvo}" — subindo SEM canal (institucional genérico, 5% do tempo em vez de 20%). Confira o nome real em inventory_segments_v2.`);
    }

    console.log(`⬆️  ${peca.id}: enviando...`);
    const resultado = await subirPeca(peca, segmentId);

    if (resultado.ok) {
      console.log(`✅ ${peca.id} — id ${resultado.id}`);
    } else {
      console.error(`❌ ${peca.id}: ${resultado.error}`);
    }
  }

  console.log('\nPronto! Confira em doohplay.com.br/admin — aba Institucional.');
}

main().catch(err => {
  console.error('Erro geral:', err);
  process.exit(1);
});
