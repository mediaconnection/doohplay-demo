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

interface PlayerMedia {
  id: string;
  name: string;
  type: string;
  url: string;
  duration: number;
  category: SlotCategory;
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
    const institutionalQuery = pool.query<{ id: string; name: string; type: string; url: string; duration: number }>(`
      SELECT id, name, type, url, duration
      FROM institutional_media
      WHERE active = true
      ORDER BY position ASC
    `)

    const [clientRes, networkRes, institutionalRes] = await Promise.all([
      clientQuery, networkQuery, institutionalQuery,
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
      }))

    const network: PlayerMedia[] = networkRes.rows.map((r: { id: string; name: string; type: string; url: string }) => ({
      id: r.id, name: r.name, type: r.type, url: r.url, duration: 15, category: "rede" as SlotCategory,
    }))

    const institutional: PlayerMedia[] = institutionalRes.rows.map((r: { id: string; name: string; type: string; url: string; duration: number }) => ({
      id: r.id, name: r.name, type: r.type, url: r.url,
      duration: Number(r.duration) || 15, category: "institucional" as SlotCategory,
    }))

    return {
      name: rows[0]?.name ?? "DOOHPLAY",
      business_type: rows[0]?.business_type ?? "",
      primary_color: rows[0]?.primary_color ?? "#3B82F6",
      medias: [...ownAndAds, ...network, ...institutional],
    }
  } catch {
    return { name: "DOOHPLAY", business_type: "", primary_color: "#3B82F6", medias: [] as PlayerMedia[] }
  }
}

export const metadata = {
  title: "DOOHPLAY Player",
  viewport: "width=device-width, initial-scale=1",
}

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>
}) {
  const { screen } = await searchParams
  const code = screen?.toUpperCase() ?? ""
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

  const playerInnerHtml = `<div id="progress-bar"></div><div id="heartbeat"></div>${qrFooterHtml}${bodyContentHtml}`

  const mediasJson = JSON.stringify(data.medias)

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
          /* QR code fixo no rodapé — captura de leads via Clube de Telas/CRM */
          #qr-footer {
            position: fixed;
            bottom: 10px; right: 10px;
            background: rgba(255,255,255,0.95);
            border-radius: 8px;
            padding: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 90;
          }
          #qr-footer img {
            width: 56px; height: 56px;
            display: block;
          }
          #qr-footer .qr-label {
            font-size: 10px;
            font-weight: 700;
            color: #0B1120;
            line-height: 1.3;
            max-width: 60px;
          }
        `}</style>
      <div id="player" dangerouslySetInnerHTML={{ __html: playerInnerHtml }} />

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var medias   = ${mediasJson};
            var code     = ${JSON.stringify(code)};
            var timer    = null;
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

            groups = buildGroups(medias);

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

            function createMediaElement(m) {
              var el;
              if (m.type === 'video') {
                el = document.createElement('video');
                el.muted = true;
                el.playsInline = true;
                el.preload = 'auto';
              } else {
                el = document.createElement('img');
                el.alt = m.name || '';
              }
              el.setAttribute('data-id', m.id);
              el.setAttribute('data-duration', m.duration);
              return el;
            }

            function releaseSlot(slot) {
              if (!slot) return;
              var el = slot.querySelector('video, img');
              if (el && el.tagName === 'VIDEO') {
                try {
                  el.pause();
                  el.removeAttribute('src');
                  el.load(); // força o decodificador a descartar o buffer
                } catch (e) {}
              }
              slot.innerHTML = '';
              slot.classList.remove('active');
            }

            function fillSlot(slot, m) {
              releaseSlot(slot);
              var el = createMediaElement(m);
              if (m.type === 'video') {
                el.src = m.url;
              } else {
                el.src = m.url;
              }
              slot.appendChild(el);
              return el;
            }

            function initSlots() {
              var container = document.getElementById('slides');
              if (!container) return;
              container.innerHTML = '';
              slotA = document.createElement('div');
              slotB = document.createElement('div');
              slotA.className = 'slide';
              slotB.className = 'slide';
              container.appendChild(slotA);
              container.appendChild(slotB);
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
                      };
                    });

                  if (fresh.length === 0) return; // evita apagar a tela se a API falhar parcialmente

                  if (mediasChanged(medias, fresh)) {
                    medias = fresh;
                    groups = buildGroups(medias);
                    cursors = { dono: 0, anunciante: 0, rede: 0, institucional: 0 };
                    // não força troca imediata — deixa o ciclo atual terminar
                    // normalmente; o próximo pickNextMedia já usa os grupos novos
                  }
                })
                .catch(function() {
                  // Falha de rede no polling não deve travar o player —
                  // mantém a playlist atual em memória e tenta de novo no próximo ciclo
                });
            }

            // Sem mídia — apenas heartbeat
            if (!medias.length) {
              sendHeartbeat();
              setInterval(sendHeartbeat, 30000);
              setInterval(pollPlaylist, POLL_INTERVAL_MS);
              return;
            }

            initSlots();

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
                var loadedEl = targetSlot.querySelector('video, img');
                if (!loadedEl || loadedEl.getAttribute('data-id') !== m.id) {
                  // Pré-carregado não corresponde ao esperado (playlist mudou
                  // no meio do caminho) — refaz o conteúdo deste slot agora.
                  fillSlot(targetSlot, m);
                }
                // Libera o slot que estava em exibição até agora.
                releaseSlot(activeSlot);
              }

              activeSlot = targetSlot;
              activeSlot.classList.add('active');

              var dur = (Number(m.duration) || 15) * 1000;
              var mediaId = m.id;
              var el = activeSlot.querySelector('video, img');

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
              fetch('/api/player/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_id: mediaId, screen_code: screenCode, played_at: new Date().toISOString() })
              }).catch(function(){});
            }

            function sendHeartbeat() {
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
            var RELOAD_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 horas
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
