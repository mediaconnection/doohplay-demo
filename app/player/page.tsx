// app/player/page.tsx
// Página exibida na TV via Fire Stick — modo kiosk, sem nav, fullscreen
export const dynamic = "force-dynamic"

import { getPool } from "@/lib/db"

interface PlayerMediaRow {
  name: string;
  business_type: string;
  primary_color: string;
  id: string;
  media_name: string;
  media_type: string;
  media_url: string;
  duration: number;
  active: boolean;
  position: number;
  slot_category: SlotCategory;
}

type SlotCategory = "dono" | "anunciante" | "rede" | "institucional";
type DisplayFormat = "fullscreen" | "shrink_lateral";

interface PlayerMedia {
  id: string;
  name: string;
  type: string;
  url: string;
  duration: number;
  category: SlotCategory;
  displayFormat: DisplayFormat;
}

async function getPlayerData(code: string) {
  const pool = getPool()
  const upperCode = code.toUpperCase()
  try {
    // ── Cliente + conteúdo do dono e de anunciantes (CampaignMedia) ──
    const clientQuery = pool.query<PlayerMediaRow>(`
      SELECT
        sc.name,
        sc.business_type,
        sc.primary_color,
        cm.id,
        cm.name              AS media_name,
        cm.type               AS media_type,
        cm.url                AS media_url,
        COALESCE(ps.duration, 15)     AS duration,
        COALESCE(ps.active, true)     AS active,
        COALESCE(ps.position, 0)      AS position,
        cm.content_source             AS slot_category
      FROM studio_clients sc
      LEFT JOIN "Campaign" c ON c."advertiserCode" = sc.code
      LEFT JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
      LEFT JOIN playlist_schedule ps ON ps.media_id = cm.id AND ps.client_code = sc.code
      WHERE sc.code = $1
        AND sc.active = true
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [upperCode])

    // ── Rede (Clube de Telas) — mídias de parceiros distribuídas para esta tela ──
    const networkQuery = pool.query<{ id: string; name: string; type: string; url: string }>(`
      SELECT nm.id, nm.name, nm.type, nm.url
      FROM network_media_distribution nmd
      JOIN network_media nm ON nm.id = nmd.network_media_id
      WHERE nmd.displayed_on_code = $1
        AND nmd.active = true
        AND nm.status = 'approved'
    `, [upperCode])

    // ── Institucional (DOOHPLAY) — exibido em todas as telas ──
    const institutionalQuery = pool.query<{ id: string; name: string; type: string; url: string; duration: number; display_format: string }>(`
      SELECT id, name, type, url, duration, display_format
      FROM institutional_media
      WHERE active = true
      ORDER BY position ASC
    `)

    // ── Anunciante real — campanha de terceiro vinculada a esta tela ──
    const realAdsQuery = pool.query<{ id: string; name: string; type: string; url: string }>(`
      SELECT cm.id, cm.name, cm.type, cm.url
      FROM "CampaignScreen" cs
      JOIN "Campaign" c ON c.id = cs."campaignId"
      JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
      WHERE cs."screenId" = $1
        AND c.status = 'active'
        AND c."startDate" <= NOW()
        AND c."endDate" >= NOW()
        AND cm.status != 'rejected'
    `, [upperCode])

    const [clientRes, networkRes, institutionalRes, realAdsRes] = await Promise.all([
      clientQuery, networkQuery, institutionalQuery, realAdsQuery,
    ])
    const rows = clientRes.rows

    const ownAndAds: PlayerMedia[] = rows
      .filter((r: PlayerMediaRow) => r.media_url && r.active)
      .map((r: PlayerMediaRow) => ({
        id: r.id,
        name: r.media_name,
        type: r.media_type,
        url: r.media_url,
        duration: Number(r.duration) || 15,
        category: (r.slot_category as SlotCategory) || "dono",
        displayFormat: "fullscreen" as DisplayFormat,
      }))

    const network: PlayerMedia[] = networkRes.rows.map((r: { id: string; name: string; type: string; url: string }) => ({
      id: r.id, name: r.name, type: r.type, url: r.url, duration: 15, category: "rede" as SlotCategory,
      displayFormat: "fullscreen" as DisplayFormat,
    }))

    const institutional: PlayerMedia[] = institutionalRes.rows.map((r: { id: string; name: string; type: string; url: string; duration: number; display_format: string }) => ({
      id: r.id, name: r.name, type: r.type, url: r.url,
      duration: Number(r.duration) || 15, category: "institucional" as SlotCategory,
      displayFormat: (r.display_format === "shrink_lateral" ? "shrink_lateral" : "fullscreen") as DisplayFormat,
    }))

    const realAds: PlayerMedia[] = realAdsRes.rows.map((r: { id: string; name: string; type: string; url: string }) => ({
      id: r.id, name: r.name, type: r.type, url: r.url, duration: 15, category: "anunciante" as SlotCategory,
      displayFormat: "fullscreen" as DisplayFormat,
    }))

    return {
      name: rows[0]?.name ?? "DOOHPLAY",
      business_type: rows[0]?.business_type ?? "",
      primary_color: rows[0]?.primary_color ?? "#3B82F6",
      medias: [...ownAndAds, ...network, ...institutional, ...realAds],
    }
  } catch {
    return { name: "DOOHPLAY", business_type: "", primary_color: "#3B82F6", medias: [] as PlayerMedia[] }
  }
}

export const metadata = {
  title: "DOOHPLAY Player",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string; preview?: string }>
}) {
  const { screen, preview } = await searchParams
  const code = screen?.toUpperCase() ?? ""
  const isPreview = preview === "1"
  const data = await getPlayerData(code)

  function escapeHtml(s: string) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }

  const slidesHtml = data.medias.map((m: PlayerMedia, i: number) => {
    const cls = `slide${i === 0 ? " active" : ""}`
    const inner = m.type === "video"
      ? `<video src="${escapeHtml(m.url)}" autoplay muted playsinline></video>`
      : `<img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.name)}" />`
    return `<div class="${cls}" data-duration="${m.duration}" data-id="${escapeHtml(m.id)}">${inner}</div>`
  }).join("")

  const qrFooterHtml = code
    ? `<div id="qr-footer"><img src="/api/qrcode/${escapeHtml(code)}" alt="QR code" /><span class="qr-label">Receba novidades</span></div>`
    : ""

  const bodyContentHtml = data.medias.length === 0
    ? `<div class="default-screen">
        <div class="logo-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="logo-text">DOOH<span>PLAY</span></div>
        <div class="tagline">${escapeHtml(data.name)}</div>
        <div class="screen-code">📺 ${escapeHtml(code)} — Aguardando conteúdo</div>
      </div>`
    : `<div id="slides">${slidesHtml}</div>`

  const playerInnerHtml = `<div id="progress-bar"></div><div id="heartbeat"></div>${qrFooterHtml}<div id="main-zone"><div id="content-area">${bodyContentHtml}</div></div><div id="lateral-zone"></div>`

  const mediasJson = JSON.stringify(data.medias)
  const buildVersion = process.env.RENDER_GIT_COMMIT || "dev"

  return (
    <>
      <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100vw; height: 100vh;
            background: #000;
            overflow: hidden;
            font-family: 'Inter', system-ui, sans-serif;
          }
          #player {
            width: 100vw; height: 100vh;
            position: relative;
            background: #0F172A;
            display: flex;
            flex-direction: row;
          }
          /* ── Compositor de zonas (Fase 3) ──────────────────────────────
             #main-zone é o conteúdo de sempre (fullscreen), agora dentro de
             um container flex em vez de ocupar o #player inteiro. Quando
             existe conteúdo "encolhe lateral" ativo, #player ganha a classe
             .has-lateral, que reduz #main-zone e abre #lateral-zone do lado.
             Sem nenhum item shrink_lateral, o comportamento é IDÊNTICO ao
             fullscreen de sempre — largura de #lateral-zone fica em 0. */
          #main-zone {
            position: relative;
            flex: 1 1 auto;
            height: 100%;
            min-width: 0;
            transition: flex-basis .5s ease;
          }
          #lateral-zone {
            position: relative;
            width: 0;
            height: 100%;
            overflow: hidden;
            flex-shrink: 0;
            background: #000;
            transition: width .5s ease;
          }
          #player.has-lateral #lateral-zone {
            width: 26vw;
          }
          #lateral-zone video, #lateral-zone img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: none;
          }
          .slide {
            position: absolute;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
          }
          .slide.active { display: flex; }
          .slide img, .slide video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          /* Elimina o "flash" do ícone nativo de play que alguns WebViews
             Android/Chromium mostram por uma fração de segundo na primeira
             reprodução de cada elemento <video> recém-criado, mesmo com
             autoplay+muted+playsinline já configurados via JS. */
          video::-webkit-media-controls,
          video::-webkit-media-controls-start-playback-button,
          video::-webkit-media-controls-play-button,
          video::-webkit-media-controls-overlay-play-button {
            display: none !important;
            -webkit-appearance: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          /* Fallback quando não há mídia */
          .default-screen {
            width: 100vw; height: 100vh;
            background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #F1F5F9;
          }
          .logo-icon {
            width: 80px; height: 80px;
            background: linear-gradient(135deg, #3B82F6, #6366F1);
            border-radius: 20px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 24px;
          }
          .logo-text {
            font-size: 48px; font-weight: 900;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
          }
          .logo-text span { color: #3B82F6; }
          .tagline { font-size: 18px; color: #64748B; }
          .screen-code {
            margin-top: 32px;
            font-size: 14px; color: #374151;
            background: #1E293B;
            padding: 8px 20px; border-radius: 20px;
          }
          /* Barra de progresso */
          #progress-bar {
            position: fixed;
            bottom: 0; left: 0;
            height: 3px;
            background: #3B82F6;
            width: 0%;
            transition: width linear;
            z-index: 100;
          }
          /* Heartbeat indicator */
          #heartbeat {
            position: fixed;
            top: 12px; right: 12px;
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #10B981;
            opacity: 0;
            z-index: 100;
          }
          /* QR code fixo no rodapé — captura de leads via Clube de Telas/CRM.
             Só fica visível nos últimos segundos de cada slide (controlado
             via JS, classe .qr-visible), pra não competir visualmente com
             o conteúdo o tempo todo. */
          #qr-footer {
            position: fixed;
            bottom: 10px; right: 10px;
            background: rgba(255,255,255,0.95);
            border-radius: 8px;
            padding: 5px;
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 90;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity .4s ease, transform .4s ease;
            pointer-events: none;
          }
          #qr-footer.qr-visible {
            opacity: 1;
            transform: translateY(0);
          }
          #qr-footer img {
            width: 36px; height: 36px;
            display: block;
          }
          #qr-footer .qr-label {
            font-size: 9px;
            font-weight: 700;
            color: #0B1120;
            line-height: 1.25;
            max-width: 48px;
          }
        `}</style>
      <div id="player" dangerouslySetInnerHTML={{ __html: playerInnerHtml }} />

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var medias   = ${mediasJson};
            var code     = ${JSON.stringify(code)};
            var isPreview = ${JSON.stringify(isPreview)};
            var buildVersion = ${JSON.stringify(buildVersion)};
            var timer    = null;
            var qrTimer  = null;
            var qrEl     = document.getElementById('qr-footer');
            var progress = document.getElementById('progress-bar');
            var hb       = document.getElementById('heartbeat');
            var POLL_INTERVAL_MS = 2 * 60 * 1000; // verifica mudanças a cada 2 minutos

            // ── Divisão de slots por categoria ────────────────────────────────
            // 15% dono / 60% anunciante pago / 15% rede (Clube de Telas) / 10% institucional.
            // Quando uma categoria está vazia (ex: cliente ainda sem anunciante
            // pago), seu peso é redistribuído proporcionalmente entre as que têm
            // conteúdo — a tela nunca trava esperando uma categoria inexistente.
            var CATEGORY_WEIGHTS = { dono: 15, anunciante: 60, rede: 15, institucional: 10 };
            var groups  = {};  // { dono: [...], anunciante: [...], rede: [...], institucional: [...] }
            var cursors = { dono: 0, anunciante: 0, rede: 0, institucional: 0 };
            var upcoming = null; // próxima mídia já sorteada e pré-carregada

            // ── Compositor de zonas (Fase 3) ───────────────────────────────
            // mainMedias: tudo que é fullscreen (comportamento de sempre).
            // lateralMedias: itens marcados "encolhe lateral" — tocam numa
            // zona separada, à parte do ciclo principal, sem competir pelos
            // pesos de categoria (ficam sempre visíveis girando entre si
            // enquanto existir pelo menos um).
            var mainMedias = [];
            var lateralMedias = [];
            function splitByFormat(list) {
              var main = [], lateral = [];
              for (var i = 0; i < list.length; i++) {
                if (list[i].displayFormat === 'shrink_lateral') lateral.push(list[i]);
                else main.push(list[i]);
              }
              return { main: main, lateral: lateral };
            }

            function buildGroups(list) {
              var g = { dono: [], anunciante: [], rede: [], institucional: [] };
              for (var i = 0; i < list.length; i++) {
                var cat = list[i].category;
                if (!g[cat]) g[cat] = [];
                g[cat].push(list[i]);
              }
              return g;
            }

            function pickNextMedia() {
              var available = [];
              var totalWeight = 0;
              for (var cat in CATEGORY_WEIGHTS) {
                if (groups[cat] && groups[cat].length > 0) {
                  available.push(cat);
                  totalWeight += CATEGORY_WEIGHTS[cat];
                }
              }
              if (available.length === 0) return null;

              var r = Math.random() * totalWeight;
              var acc = 0;
              var chosen = available[available.length - 1];
              for (var j = 0; j < available.length; j++) {
                acc += CATEGORY_WEIGHTS[available[j]];
                if (r <= acc) { chosen = available[j]; break; }
              }

              var list = groups[chosen];
              var idx = cursors[chosen] % list.length;
              cursors[chosen] = idx + 1;
              return list[idx];
            }

            var split = splitByFormat(medias);
            mainMedias = split.main;
            lateralMedias = split.lateral;
            groups = buildGroups(mainMedias);

            // ── Zona lateral — slot único, ciclo próprio e independente ────
            var playerEl = document.getElementById('player');
            var lateralZoneEl = document.getElementById('lateral-zone');
            var lateralVideoEl = null;
            var lateralImgEl = null;
            var lateralTimer = null;
            var lateralIdx = 0;

            function initLateralZone() {
              if (!lateralZoneEl) return;
              lateralZoneEl.innerHTML = '';
              lateralVideoEl = document.createElement('video');
              lateralVideoEl.muted = true;
              lateralVideoEl.playsInline = true;
              lateralVideoEl.setAttribute('muted', '');
              lateralVideoEl.setAttribute('playsinline', '');
              lateralVideoEl.setAttribute('webkit-playsinline', '');
              lateralVideoEl.disableRemotePlayback = true;
              lateralImgEl = document.createElement('img');
              lateralZoneEl.appendChild(lateralVideoEl);
              lateralZoneEl.appendChild(lateralImgEl);
            }

            function showLateralSlide() {
              if (lateralTimer) { clearTimeout(lateralTimer); lateralTimer = null; }
              if (!lateralMedias.length) {
                if (playerEl) playerEl.classList.remove('has-lateral');
                return;
              }
              if (playerEl) playerEl.classList.add('has-lateral');
              if (!lateralVideoEl) initLateralZone();

              var m = lateralMedias[lateralIdx % lateralMedias.length];
              lateralIdx++;

              var el = (m.type === 'video') ? lateralVideoEl : lateralImgEl;
              var other = (m.type === 'video') ? lateralImgEl : lateralVideoEl;
              other.style.display = 'none';
              if (other.tagName === 'VIDEO') { try { other.pause(); } catch (e) {} }

              if (el.tagName === 'IMG') el.alt = m.name || '';
              if (el.src !== m.url) el.src = m.url;
              el.style.display = 'block';

              var dur = (Number(m.duration) || 15) * 1000;
              if (el.tagName === 'VIDEO') {
                el.currentTime = 0;
                el.onerror = function() {};
                var p = el.play();
                if (p && typeof p.catch === 'function') p.catch(function() {});
              }

              lateralTimer = setTimeout(showLateralSlide, dur);
            }

            // ── Arquitetura de renderização sob demanda ──────────────────────
            // Em vez de criar um elemento <img>/<video> para CADA mídia da
            // playlist de uma vez (o que crescia com o tamanho da rede de
            // anunciantes e sobrecarregava a memória de TVs com hardware
            // limitado), mantemos só DOIS slots fixos no DOM:
            //   slotA / slotB — alternam entre "atual" e "próximo pré-carregado"
            // Isso mantém o uso de memória constante, não importa se a
            // playlist tem 5 ou 500 itens.

            var slotA = null;
            var slotB = null;
            var activeSlot = null; // referência ao slot atualmente visível

            // Cada slot mantém UM <video> e UM <img> fixos, criados uma
            // única vez, escondidos via display:none quando não usados.
            // Antes, cada troca de mídia criava um <video> NOVO do zero —
            // e WebViews Android/Chromium mostram um ícone nativo de play
            // por uma fração de segundo na primeira reprodução de cada
            // elemento <video> recém-criado, mesmo com autoplay+muted já
            // configurados. Reaproveitar o mesmo elemento e só trocar o
            // .src elimina esse "flash", porque o navegador não trata
            // isso como uma "nova" reprodução de mídia.
            function createSlot() {
              var div = document.createElement('div');
              div.className = 'slide';

              var video = document.createElement('video');
              video.muted = true;
              video.playsInline = true;
              video.preload = 'auto';
              video.controls = false;
              video.disableRemotePlayback = true;
              video.setAttribute('muted', '');
              video.setAttribute('autoplay', '');
              video.setAttribute('playsinline', '');
              video.setAttribute('webkit-playsinline', '');
              video.setAttribute('disablePictureInPicture', '');
              video.setAttribute('disableRemotePlayback', '');
              video.setAttribute('controlsList', 'nodownload noplaybackrate nofullscreen');
              video.style.display = 'none';

              var img = document.createElement('img');
              img.style.display = 'none';

              div.appendChild(video);
              div.appendChild(img);

              return { el: div, video: video, img: img };
            }

            function releaseSlot(slot) {
              if (!slot) return;
              try { slot.video.pause(); } catch (e) {}
              slot.el.classList.remove('active');
            }

            function fillSlot(slot, m) {
              var el = (m.type === 'video') ? slot.video : slot.img;
              var other = (m.type === 'video') ? slot.img : slot.video;

              other.style.display = 'none';
              if (other.tagName === 'VIDEO') {
                try { other.pause(); } catch (e) {}
              }

              if (el.tagName === 'IMG') {
                el.alt = m.name || '';
              }
              // Só reatribui o src se for realmente diferente — trocar o
              // src de um <video>/<img> já existente não dispara nenhuma
              // UI nativa de mídia, ao contrário de criar um elemento novo.
              if (el.src !== m.url) {
                el.src = m.url;
              }
              el.setAttribute('data-id', m.id);
              el.setAttribute('data-duration', m.duration);
              el.style.display = 'block';
              return el;
            }

            function initSlots() {
              var container = document.getElementById('slides');
              if (!container) return;
              container.innerHTML = '';
              slotA = createSlot();
              slotB = createSlot();
              container.appendChild(slotA.el);
              container.appendChild(slotB.el);
            }

            // Tentativa de suprimir a UI nativa "Now Playing"/transport
            // controls que o Android pode exibir para qualquer <video>
            // tocando, via Media Session API — suspeito adicional para o
            // flash do ícone de play, independente do navegador/WebView.
            if ('mediaSession' in navigator) {
              try {
                navigator.mediaSession.metadata = null;
                navigator.mediaSession.playbackState = 'none';
                ['play','pause','seekbackward','seekforward','previoustrack','nexttrack','stop'].forEach(function(action) {
                  try { navigator.mediaSession.setActionHandler(action, null); } catch (e) {}
                });
              } catch (e) {}
            }

            function preloadNext(m) {
              // Pré-carrega a próxima mídia (já sorteada por pickNextMedia) no
              // slot inativo, para a troca ser instantânea sem esperar download.
              if (!m) return;
              var inactiveSlot = activeSlot === slotA ? slotB : slotA;
              fillSlot(inactiveSlot, m);
            }

            function mediasChanged(oldList, newList) {
              if (oldList.length !== newList.length) return true;
              for (var i = 0; i < oldList.length; i++) {
                if (oldList[i].id !== newList[i].id) return true;
                if (oldList[i].url !== newList[i].url) return true;
                if (oldList[i].duration !== newList[i].duration) return true;
              }
              return false;
            }

            // Busca a playlist atual no servidor; se mudou, atualiza a lista
            // em memória sem interromper a mídia que está passando agora —
            // o próximo preloadNext já vai refletir a playlist nova.
            function pollPlaylist() {
              // Checa se subiu um deploy novo desde que esta página carregou.
              // Roda no mesmo ciclo de 2 min do polling de conteúdo — sem
              // precisar de WebSocket nem nenhuma infraestrutura nova.
              // Se mudou, recarrega na hora (com cache-buster); se não
              // mudou, nem toca na tela.
              fetch('/api/player/version')
                .then(function(res) { return res.json(); })
                .then(function(v) {
                  if (v && v.version && v.version !== buildVersion) {
                    var base = location.pathname + '?screen=' + encodeURIComponent(code);
                    location.href = base + '&_r=' + Date.now();
                  }
                })
                .catch(function(){});

              fetch('/api/client/playlist/' + encodeURIComponent(code))
                .then(function(res) { return res.json(); })
                .then(function(data) {
                  if (!data || !Array.isArray(data.items)) return;

                  var fresh = data.items
                    .filter(function(item) {
                      return item.asset_url && item.active !== false && item.status !== 'rejected';
                    })
                    .map(function(item) {
                      return {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        url: item.asset_url,
                        duration: Number(item.duration) || 15,
                        category: item.slot_category || 'dono',
                        displayFormat: item.display_format === 'shrink_lateral' ? 'shrink_lateral' : 'fullscreen',
                      };
                    });

                  if (fresh.length === 0) return; // evita apagar a tela se a API falhar parcialmente

                  // Tela começou sem nenhuma mídia (mostrando "Aguardando
                  // conteúdo") e agora chegou a primeira — precisa montar a
                  // estrutura de slides do zero e começar o ciclo, já que
                  // isso nunca tinha sido inicializado.
                  if (medias.length === 0 && fresh.length > 0) {
                    medias = fresh;
                    var splitFirst = splitByFormat(medias);
                    mainMedias = splitFirst.main;
                    lateralMedias = splitFirst.lateral;
                    groups = buildGroups(mainMedias);
                    cursors = { dono: 0, anunciante: 0, rede: 0, institucional: 0 };
                    var contentArea = document.getElementById('content-area');
                    if (contentArea) {
                      contentArea.innerHTML = '<div id="slides"></div>';
                      slotA = null; slotB = null; activeSlot = null;
                      initSlots();
                      showSlide(pickNextMedia());
                    }
                    showLateralSlide();
                    return;
                  }

                  if (mediasChanged(medias, fresh)) {
                    medias = fresh;
                    var splitNew = splitByFormat(medias);
                    mainMedias = splitNew.main;
                    lateralMedias = splitNew.lateral;
                    groups = buildGroups(mainMedias);
                    cursors = { dono: 0, anunciante: 0, rede: 0, institucional: 0 };
                    // não força troca imediata — deixa o ciclo atual terminar
                    // normalmente; o próximo pickNextMedia já usa os grupos novos.
                    // A zona lateral também não é interrompida — o timer em
                    // curso vai ler lateralMedias atualizado na próxima virada.
                    if (!lateralTimer) showLateralSlide();
                  }
                })
                .catch(function() {
                  // Falha de rede no polling não deve travar o player —
                  // mantém a playlist atual em memória e tenta de novo no próximo ciclo
                });
            }

            // Sem mídia — apenas heartbeat
            if (!mainMedias.length && !lateralMedias.length) {
              sendHeartbeat();
              setInterval(sendHeartbeat, 30000);
              setInterval(pollPlaylist, POLL_INTERVAL_MS);
              return;
            }

            initSlots();
            showLateralSlide();

            function showSlide(m) {
              if (!m) return;

              var targetSlot;

              if (!activeSlot) {
                // Primeira chamada: ainda não há nada na tela, usa slotA direto.
                targetSlot = slotA;
                fillSlot(targetSlot, m);
              } else {
                // Nas chamadas seguintes, o slot inativo já foi pré-carregado
                // pela chamada anterior de preloadNext().
                targetSlot = (activeSlot === slotA) ? slotB : slotA;
                var loadedEl = (m.type === 'video') ? targetSlot.video : targetSlot.img;
                if (loadedEl.getAttribute('data-id') !== m.id) {
                  // Pré-carregado não corresponde ao esperado (playlist mudou
                  // no meio do caminho) — refaz o conteúdo deste slot agora.
                  fillSlot(targetSlot, m);
                }
                // Libera o slot que estava em exibição até agora.
                releaseSlot(activeSlot);
              }

              activeSlot = targetSlot;
              activeSlot.el.classList.add('active');

              var dur = (Number(m.duration) || 15) * 1000;
              var mediaId = m.id;
              var el = (m.type === 'video') ? activeSlot.video : activeSlot.img;

              // Garante que esta mídia só avança UMA vez, seja por onended,
              // erro de carregamento, falha de autoplay ou pelo timeout de
              // segurança — nunca mais de uma chamada de nextSlide() por slide.
              var advanced = false;
              function advanceOnce() {
                if (advanced) return;
                advanced = true;
                nextSlide();
              }

              if (timer) clearTimeout(timer);

              if (el && el.tagName === 'VIDEO') {
                el.currentTime = 0;
                // Vídeo corrompido, codec incompatível ou erro de rede —
                // pula para o próximo em vez de travar a tela exibindo o
                // ícone de play nativo do WebView (causa real do "player
                // entra e volta pra tela inicial" — a TV mata o app depois
                // de um tempo preso sem nada acontecendo).
                el.onerror = function() { advanceOnce(); };
                var playPromise = el.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                  // Autoplay bloqueado pela TV/WebView — também pula, em vez
                  // de ficar parado esperando um clique que nunca vai vir.
                  playPromise.catch(function() { advanceOnce(); });
                }
                el.onended = function() { advanceOnce(); };
                dur = Math.max(dur, (el.duration || 0) * 1000);
                // Rede de segurança final: mesmo que nenhum evento dispare
                // (vídeo trava no meio, "stalled" silencioso etc.), nunca
                // fica preso por mais de ~45s nesse slide.
                timer = setTimeout(advanceOnce, Math.max(dur, 45000));
              } else {
                if (el) el.onerror = function() { advanceOnce(); };
                timer = setTimeout(advanceOnce, dur);
              }

              // QR "Receba novidades": só aparece nos últimos 5s do slide,
              // em vez de ficar fixo o tempo todo competindo visualmente
              // com o conteúdo. Em slides mais curtos que 5s, aparece desde
              // o início.
              if (qrTimer) clearTimeout(qrTimer);
              if (qrEl) {
                qrEl.classList.remove('qr-visible');
                var qrShowAt = Math.max(dur - 5000, 0);
                qrTimer = setTimeout(function() {
                  if (qrEl) qrEl.classList.add('qr-visible');
                }, qrShowAt);
              }

              // Barra de progresso
              if (progress) {
                progress.style.transition = 'none';
                progress.style.width = '0%';
                setTimeout(function() {
                  progress.style.transition = 'width ' + dur + 'ms linear';
                  progress.style.width = '100%';
                }, 50);
              }

              // Registra exibição
              logDisplay(mediaId, code);

              // Sorteia (respeitando os pesos de categoria) e pré-carrega a
              // próxima mídia no slot que ficou de fundo.
              upcoming = pickNextMedia();
              preloadNext(upcoming);
            }

            function nextSlide() {
              if (!upcoming) upcoming = pickNextMedia();
              var m = upcoming;
              upcoming = null;
              showSlide(m);
            }

            function logDisplay(mediaId, screenCode) {
              if (isPreview) return; // preview no dashboard não conta como exibição real
              fetch('/api/player/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_id: mediaId, screen_code: screenCode, played_at: new Date().toISOString() })
              }).catch(function(){});
            }

            function sendHeartbeat() {
              if (isPreview) return; // idem — não marca heartbeat real pela visualização do dashboard
              fetch('/api/player/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ screen_code: code })
              }).then(function() {
                if (hb) {
                  hb.style.opacity = '1';
                  setTimeout(function() { hb.style.opacity = '0'; }, 500);
                }
              }).catch(function(){});
            }

            // ── Recarga periódica automática ──────────────────────────────────
            // Garante, sem precisar de nenhuma ação manual em cada TV, que o
            // app sempre busca o HTML/JS mais recente (em vez de confiar em
            // cache do WebView/CDN nunca expirar) e também zera qualquer
            // acúmulo de memória do processo de tempos em tempos — proteção
            // adicional contra o tipo de travamento já visto em hardware
            // mais limitado (Fire Stick / Android TV mais antigas).
            // ── Recarga periódica de segurança ────────────────────────────────
            // A checagem de versão (dentro de pollPlaylist, a cada 2 min) já
            // cobre a atualização de código de verdade. Esta aqui é só uma
            // rede de segurança extra — zera memória do processo e garante
            // uma recarga mesmo se, por algum motivo, a checagem de versão
            // falhar silenciosamente por um tempo.
            var RELOAD_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos
            setTimeout(function() {
              var base = location.pathname + '?screen=' + encodeURIComponent(code);
              location.href = base + '&_r=' + Date.now(); // cache-buster força recarga real
            }, RELOAD_INTERVAL_MS);

            // Inicia
            showSlide(pickNextMedia());
            setInterval(sendHeartbeat, 30000);
            setInterval(pollPlaylist, POLL_INTERVAL_MS);
          })();
        `}} />
    </>
  )
}
