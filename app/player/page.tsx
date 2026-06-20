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
}

async function getPlayerData(code: string) {
  const pool = getPool()
  try {
    const { rows } = await pool.query<PlayerMediaRow>(`
      SELECT
        sc.name,
        sc.business_type,
        sc.primary_color,
        cm.id,
        cm.name    AS media_name,
        cm.type    AS media_type,
        cm.url     AS media_url,
        COALESCE(ps.duration, 15) AS duration,
        COALESCE(ps.active, true) AS active,
        COALESCE(ps.position, 0)  AS position
      FROM studio_clients sc
      LEFT JOIN "Campaign" c ON c."advertiserCode" = sc.code
      LEFT JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
      LEFT JOIN playlist_schedule ps ON ps.media_id = cm.id AND ps.client_code = sc.code
      WHERE sc.code = $1
        AND sc.active = true
      ORDER BY COALESCE(ps.position, 999), cm."createdAt" ASC
    `, [code.toUpperCase()])

    return {
      name: rows[0]?.name ?? "DOOHPLAY",
      business_type: rows[0]?.business_type ?? "",
      primary_color: rows[0]?.primary_color ?? "#3B82F6",
      medias: rows.filter((r: PlayerMediaRow) => r.media_url && r.active).map((r: PlayerMediaRow) => ({
        id: r.id,
        name: r.media_name,
        type: r.media_type,
        url: r.media_url,
        duration: Number(r.duration) || 15,
      }))
    }
  } catch {
    return { name: "DOOHPLAY", business_type: "", primary_color: "#3B82F6", medias: [] }
  }
}

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>
}) {
  const { screen } = await searchParams
  const code = screen?.toUpperCase() ?? ""
  const data = await getPlayerData(code)

  const mediasJson = JSON.stringify(data.medias)

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DOOHPLAY Player</title>
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
        `}</style>
      </head>
      <body>
        <div id="player">
          <div id="progress-bar"></div>
          <div id="heartbeat"></div>

          {data.medias.length === 0 ? (
            <div className="default-screen">
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="logo-text">DOOH<span>PLAY</span></div>
              <div className="tagline">{data.name}</div>
              <div className="screen-code">📺 {code} — Aguardando conteúdo</div>
            </div>
          ) : (
            <div id="slides">
              {data.medias.map((m: { id: string; name: string; type: string; url: string; duration: number }, i: number) => (
                <div key={m.id} className={`slide${i === 0 ? " active" : ""}`} data-duration={m.duration} data-id={m.id}>
                  {m.type === "video" ? (
                    <video src={m.url} autoPlay muted playsInline loop={false} />
                  ) : (
                    <img src={m.url} alt={m.name} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var medias   = ${mediasJson};
            var code     = ${JSON.stringify(code)};
            var current  = 0;
            var timer    = null;
            var progress = document.getElementById('progress-bar');
            var hb       = document.getElementById('heartbeat');
            var POLL_INTERVAL_MS = 2 * 60 * 1000; // verifica mudanças a cada 2 minutos

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

            function preloadNext(idx) {
              // Pré-carrega a próxima mídia no slot inativo, para a troca
              // ser instantânea sem precisar esperar o download.
              var nextIdx = (idx + 1) % medias.length;
              var inactiveSlot = activeSlot === slotA ? slotB : slotA;
              fillSlot(inactiveSlot, medias[nextIdx]);
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
                      };
                    });

                  if (fresh.length === 0) return; // evita apagar a tela se a API falhar parcialmente

                  if (mediasChanged(medias, fresh)) {
                    medias = fresh;
                    if (current >= medias.length) current = 0;
                    // não força troca imediata — deixa o ciclo atual terminar
                    // normalmente; o próximo preloadNext já usa a lista nova
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

            function showSlide(idx) {
              var m = medias[idx];
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

              if (el && el.tagName === 'VIDEO') {
                el.currentTime = 0;
                el.play().catch(function(){});
                el.onended = function() { nextSlide(); };
                dur = Math.max(dur, (el.duration || 15) * 1000);
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

              // Pré-carrega a próxima mídia no slot que ficou de fundo
              preloadNext(idx);

              // Timer para próximo slide (apenas para imagens; vídeo usa onended)
              if (timer) clearTimeout(timer);
              if (!el || el.tagName !== 'VIDEO') {
                timer = setTimeout(nextSlide, dur);
              }
            }

            function nextSlide() {
              current = (current + 1) % medias.length;
              // Garante que current nunca aponte para fora da lista
              // se a playlist encolheu durante o polling
              if (current >= medias.length) current = 0;
              showSlide(current);
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

            // Inicia
            showSlide(0);
            setInterval(sendHeartbeat, 30000);
            setInterval(pollPlaylist, POLL_INTERVAL_MS);
          })();
        `}} />
      </body>
    </html>
  )
}
