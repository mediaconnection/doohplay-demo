export const dynamic = "force-dynamic"

export function GET() {
  const html = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DOOHPLAY para Turismo — Anuncie sua agência, hotel ou passagem em telas reais</title>
<meta name="description" content="Alcance quem está esperando — na barbearia, na farmácia, na academia — com sua promoção de viagem, pacote ou hospedagem. Publicidade em telas físicas, de verdade, sem depender de clique.">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui,-apple-system,sans-serif; background:#0B1120; color:#F1F5F9; overflow-x:hidden; }

/* NAV */
nav { padding:16px 24px; display:flex; align-items:center; justify-content:space-between; max-width:960px; margin:0 auto; }
.logo { font-size:20px; font-weight:900; color:#F9FAFB; text-decoration:none; }
.logo span { color:#3B82F6; }
.nav-cta { background:#3B82F6; color:white; padding:8px 20px; border-radius:20px; font-size:13px; font-weight:700; text-decoration:none; }

/* HERO */
.hero { text-align:center; padding:48px 24px 40px; max-width:700px; margin:0 auto; }
.hero-tag { display:inline-block; background:#1e3a5f; color:#60A5FA; border:1px solid #3B82F644; border-radius:20px; padding:6px 16px; font-size:12px; font-weight:700; margin-bottom:20px; }
.hero h1 { font-size:clamp(32px,6vw,56px); font-weight:900; line-height:1.1; margin-bottom:20px; }
.hero h1 span { color:#3B82F6; }
.hero p { font-size:18px; color:#94A3B8; line-height:1.6; margin-bottom:32px; max-width:520px; margin-left:auto; margin-right:auto; }
.hero-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.btn-main { background:linear-gradient(135deg,#3B82F6,#6366F1); color:white; padding:16px 32px; border-radius:14px; font-size:16px; font-weight:700; text-decoration:none; display:inline-block; }
.btn-sec { background:transparent; color:#94A3B8; padding:16px 24px; border-radius:14px; font-size:15px; font-weight:600; text-decoration:none; border:1px solid #334155; display:inline-block; }

/* TV VISUAL */
.tv-section { padding:40px 24px; display:flex; justify-content:center; }
.tv-wrap { position:relative; max-width:500px; width:100%; }
.tv-frame { background:#1E293B; border:3px solid #334155; border-radius:16px; padding:16px; position:relative; }
.tv-screen { background:#0B1120; border-radius:10px; aspect-ratio:16/9; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; }
.tv-content { text-align:center; }
.tv-content .promo { font-size:clamp(14px,3vw,22px); font-weight:900; color:#F1F5F9; margin-bottom:6px; }
.tv-content .sub { font-size:clamp(10px,2vw,14px); color:#94A3B8; }
.tv-badge { position:absolute; top:12px; right:12px; background:#10B981; color:white; font-size:10px; font-weight:700; padding:4px 10px; border-radius:10px; }
.tv-ad { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(135deg,#1e3a5f,#1e1b4b); border-top:2px solid #3B82F6; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; }
.tv-ad-text { font-size:clamp(9px,1.5vw,12px); color:#93C5FD; }
.tv-ad-logo { font-size:clamp(9px,1.5vw,11px); font-weight:700; color:#60A5FA; }
.tv-stand { width:60px; height:10px; background:#334155; border-radius:4px; margin:0 auto 4px; }
.tv-base { width:100px; height:6px; background:#334155; border-radius:4px; margin:0 auto; }

/* COMO FUNCIONA */
.section { padding:48px 24px; max-width:700px; margin:0 auto; }
.section-tag { font-size:12px; font-weight:700; color:#3B82F6; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; text-align:center; }
.section-title { font-size:clamp(24px,4vw,36px); font-weight:900; text-align:center; margin-bottom:36px; line-height:1.2; }

.steps { display:flex; flex-direction:column; gap:16px; }
.step { display:flex; gap:16px; align-items:flex-start; background:#1E293B; border:1px solid #334155; border-radius:16px; padding:20px; }
.step-icon { font-size:32px; flex-shrink:0; }
.step-content {}
.step-title { font-size:17px; font-weight:700; color:#F1F5F9; margin-bottom:4px; }
.step-desc { font-size:14px; color:#94A3B8; line-height:1.5; }

/* ONDE APARECE */
.canal-box { background:linear-gradient(135deg,#0f2a3a,#0b1120); border:1px solid #0EA5E944; border-radius:20px; padding:28px; max-width:700px; margin:0 auto 48px; }
.canal-tag { display:inline-block; background:#0EA5E922; color:#38BDF8; border:1px solid #0EA5E955; border-radius:20px; padding:5px 14px; font-size:12px; font-weight:700; margin-bottom:14px; }
.canal-title { font-size:20px; font-weight:900; margin-bottom:10px; }
.canal-desc { font-size:14px; color:#94A3B8; line-height:1.6; }

/* POR QUE ANUNCIAR AQUI */
.segs { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.seg { background:#1E293B; border:1px solid #334155; border-radius:14px; padding:20px; }
.seg-icon { font-size:28px; margin-bottom:10px; }
.seg-name { font-size:15px; font-weight:700; color:#F1F5F9; margin-bottom:4px; }
.seg-desc { font-size:13px; color:#64748B; line-height:1.4; }

/* PROVA SOCIAL */
.prova { background:linear-gradient(135deg,#1e3a5f22,#1e1b4b22); border:1px solid #3B82F633; border-radius:20px; padding:28px; max-width:700px; margin:0 auto 48px; }
.prova-quote { font-size:16px; color:#CBD5E1; line-height:1.7; font-style:italic; margin-bottom:16px; }
.prova-author { display:flex; align-items:center; gap:12px; }
.prova-avatar { width:44px; height:44px; background:linear-gradient(135deg,#3B82F6,#6366F1); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:white; flex-shrink:0; }
.prova-name { font-size:14px; font-weight:700; color:#F1F5F9; }
.prova-place { font-size:12px; color:#64748B; }
.online-dot { display:inline-block; width:8px; height:8px; background:#10B981; border-radius:50%; margin-right:4px; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }

/* INVESTIMENTO */
.invest-box { background:#1E293B; border:1px solid #334155; border-radius:20px; padding:32px; max-width:700px; margin:0 auto 48px; text-align:center; }
.invest-title { font-size:20px; font-weight:900; margin-bottom:12px; }
.invest-desc { font-size:14px; color:#94A3B8; line-height:1.6; margin-bottom:24px; }

/* FAQ */
.faq { display:flex; flex-direction:column; gap:10px; }
.faq-item { background:#1E293B; border:1px solid #334155; border-radius:12px; overflow:hidden; }
.faq-q { padding:16px 20px; font-size:15px; font-weight:600; color:#F1F5F9; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.faq-q span { color:#64748B; font-size:18px; transition:transform .2s; }
.faq-q.open span { transform:rotate(45deg); }
.faq-a { display:none; padding:0 20px 16px; font-size:14px; color:#94A3B8; line-height:1.6; }
.faq-a.show { display:block; }

/* CTA FINAL */
.cta-final { background:linear-gradient(135deg,#1e3a5f,#1e1b4b); border:1px solid #3B82F644; border-radius:24px; padding:40px 28px; text-align:center; max-width:700px; margin:0 auto 48px; }
.cta-final h2 { font-size:clamp(24px,4vw,36px); font-weight:900; margin-bottom:12px; }
.cta-final p { font-size:15px; color:#94A3B8; margin-bottom:28px; line-height:1.6; }

/* FOOTER */
footer { border-top:1px solid #1E293B; padding:24px; text-align:center; font-size:12px; color:#475569; }

@media(max-width:480px){
  .segs { grid-template-columns:1fr 1fr; }
  .hero-btns { flex-direction:column; align-items:center; }
  .btn-main, .btn-sec { width:100%; text-align:center; }
}
</style>
</head>
<body>

<nav>
  <a href="/" class="logo">DOOH<span>PLAY</span></a>
  <a href="/anunciante/novo" class="nav-cta">Anunciar agora</a>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-tag">✈️ Feito para agências, hotéis e turismo</div>
  <h1>Sua promoção de viagem<br>na tela onde as pessoas<br><span>já estão esperando</span></h1>
  <p>Enquanto seu cliente em potencial espera na barbearia, na farmácia ou na academia, sua promoção de pacote, passagem ou hospedagem aparece em telas reais — sem precisar de clique, sem depender de algoritmo.</p>
  <div class="hero-btns">
    <a href="/anunciante/novo" class="btn-main">Quero anunciar no DOOHPLAY ✈️</a>
    <a href="/pitch" class="btn-sec">Ver como funciona →</a>
  </div>
</div>

<!-- TV VISUAL -->
<div class="tv-section">
  <div class="tv-wrap">
    <div class="tv-frame">
      <div class="tv-screen">
        <div class="tv-badge">● AO VIVO</div>
        <div class="tv-content">
          <div class="promo">✈️ Nordeste a partir de R$ 899</div>
          <div class="sub">Pacote completo — Consulte condições</div>
        </div>
        <div class="tv-ad">
          <div class="tv-ad-text">📍 Anúncio patrocinado</div>
          <div class="tv-ad-logo">Sua Agência</div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:8px">
      <div class="tv-stand"></div>
      <div class="tv-base"></div>
    </div>
  </div>
</div>

<!-- COMO FUNCIONA -->
<div class="section">
  <div class="section-tag">Como funciona</div>
  <div class="section-title">Simples assim —<br>3 passos</div>
  <div class="steps">
    <div class="step">
      <div class="step-icon">📝</div>
      <div class="step-content">
        <div class="step-title">1. Você se cadastra como anunciante</div>
        <div class="step-desc">Cadastro rápido, sem burocracia. Você recebe um código e um link exclusivo pra gerenciar suas campanhas.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-icon">🎬</div>
      <div class="step-content">
        <div class="step-title">2. Você envia sua peça publicitária</div>
        <div class="step-desc">Foto ou vídeo do seu pacote, promoção ou hospedagem. Nossa equipe revisa e aprova antes de ir ao ar.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-icon">📺</div>
      <div class="step-content">
        <div class="step-title">3. Sua campanha roda na rede de telas</div>
        <div class="step-desc">Seu anúncio aparece em telas reais de estabelecimentos parceiros, pra pessoas de verdade, no meio do dia a dia delas.</div>
      </div>
    </div>
  </div>
</div>

<!-- ONDE APARECE -->
<div class="section" style="padding-top:0">
  <div class="canal-box">
    <div class="canal-tag">📍 Onde sua campanha aparece</div>
    <div class="canal-title">Uma rede de telas em negócios do dia a dia</div>
    <div class="canal-desc">Sua campanha entra na rotação das telas de estabelecimentos parceiros — barbearias, farmácias, academias, restaurantes — sempre respeitando as preferências de cada dono de tela (nenhuma tela é obrigada a aceitar qualquer anúncio, e concorrente direto do próprio estabelecimento nunca aparece nela). É publicidade vista por gente de verdade, esperando, com tempo disponível — não um banner que passa despercebido.</div>
  </div>
</div>

<!-- POR QUE ANUNCIAR AQUI -->
<div class="section">
  <div class="section-tag">Por que anunciar no DOOHPLAY</div>
  <div class="section-title">Diferente de anúncio digital,<br>essa audiência não pula o anúncio</div>
  <div class="segs">
    <div class="seg"><div class="seg-icon">⏱️</div><div class="seg-name">Audiência com tempo disponível</div><div class="seg-desc">Gente esperando, sem pressa, prestando atenção na tela</div></div>
    <div class="seg"><div class="seg-icon">📍</div><div class="seg-name">Presença física real</div><div class="seg-desc">Sem ad-blocker, sem "pular anúncio" — a tela está lá, ligada</div></div>
    <div class="seg"><div class="seg-icon">🎯</div><div class="seg-name">Alcance local segmentado</div><div class="seg-desc">Escolha em quais tipos de estabelecimento sua campanha aparece</div></div>
    <div class="seg"><div class="seg-icon">✅</div><div class="seg-name">Aprovação e transparência</div><div class="seg-desc">Você acompanha onde e quando sua campanha está rodando, pelo seu painel</div></div>
  </div>
</div>

<!-- PROVA SOCIAL -->
<div class="section" style="padding-top:0">
  <div class="prova">
    <div class="prova-quote">"A tecnologia por trás do DOOHPLAY já está rodando ao vivo hoje — telas reais, exibindo conteúdo e anúncios de ponta a ponta. Turismo é um setor novo pra gente receber como anunciante, mas a infraestrutura que sustenta sua campanha é a mesma, testada todo dia."</div>
    <div class="prova-author">
      <div class="prova-avatar">D</div>
      <div>
        <div class="prova-name">Equipe DOOHPLAY</div>
        <div class="prova-place"><span class="online-dot"></span>Piloto real rodando desde junho/2026</div>
      </div>
    </div>
  </div>
</div>

<!-- INVESTIMENTO -->
<div class="section" style="padding-top:0">
  <div class="invest-box">
    <div class="invest-title">💰 Investimento sob consulta</div>
    <div class="invest-desc">O valor da campanha depende de quantas telas, quais segmentos e por quanto tempo você quer anunciar. Cadastre-se e fale com a gente pra montar a campanha certa pro seu orçamento — sem contrato longo, sem fidelidade.</div>
    <a href="/anunciante/novo" class="btn-main" style="display:inline-block">Quero anunciar no DOOHPLAY →</a>
  </div>
</div>

<!-- FAQ -->
<div class="section">
  <div class="section-tag">Dúvidas</div>
  <div class="section-title">Perguntas frequentes</div>
  <div class="faq">
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Preciso ser uma agência grande pra anunciar? <span>+</span></div>
      <div class="faq-a">Não. Agências pequenas, hotéis independentes, pousadas e até guias de turismo locais podem anunciar — o cadastro é o mesmo pra qualquer tamanho de negócio.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Como funciona a aprovação da minha campanha? <span>+</span></div>
      <div class="faq-a">Depois de enviar sua peça (foto ou vídeo), nossa equipe revisa antes de colocar no ar. Você acompanha o status pelo seu painel.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Meu concorrente pode bloquear meu anúncio? <span>+</span></div>
      <div class="faq-a">Não é bem assim — o que existe é o contrário: sua campanha nunca aparece na tela de um estabelecimento que seja seu concorrente direto (ex: outra agência de viagem). Isso é automático, protege todo mundo.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Como eu pago pela campanha? <span>+</span></div>
      <div class="faq-a">O investimento é combinado conforme o tamanho da campanha (quantas telas, quanto tempo). Depois do cadastro, nossa equipe entra em contato pra fechar os detalhes.</div>
    </div>
  </div>
</div>

<!-- CTA FINAL -->
<div style="padding:0 24px">
  <div class="cta-final">
    <h2>Coloque sua campanha<br>no ar.</h2>
    <p>Cadastro rápido, sem burocracia.<br>Fale com a gente e monte sua campanha.</p>
    <a href="/anunciante/novo" class="btn-main" style="display:inline-block">Quero anunciar →</a>
    <div style="margin-top:16px;font-size:12px;color:#475569">Dúvidas? WhatsApp: (11) 9 6205-0987</div>
  </div>
</div>

<footer>
  <div style="font-size:16px;font-weight:900;margin-bottom:8px;">DOOH<span style="color:#3B82F6">PLAY</span></div>
  <div>© 2026 DOOHPLAY · São Paulo, Brasil</div>
  <div style="margin-top:8px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/" style="color:#475569;text-decoration:none">Home</a>
    <a href="/anunciante/novo" style="color:#475569;text-decoration:none">Anunciar</a>
    <a href="/cadastro" style="color:#475569;text-decoration:none">Tenho um estabelecimento</a>
  </div>
</footer>

<script>
function toggleFaq(el) {
  el.classList.toggle('open')
  var ans = el.nextElementSibling
  ans.classList.toggle('show')
}
</script>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}
