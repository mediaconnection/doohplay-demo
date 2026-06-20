/**
 * app/lead/[code]/route.ts
 *
 * Página pública que abre quando o cliente final escaneia o QR code
 * exibido na TV de um estabelecimento. Mobile-first, formulário simples
 * com nome + WhatsApp + aceite explícito de termos (LGPD).
 *
 * URL: doohplay.com.br/lead/BARBE332
 */

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const html = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cadastre-se e receba novidades</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui,-apple-system,sans-serif; background:#0B1120; color:#F1F5F9; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.card { width:100%; max-width:400px; }
.logo { text-align:center; font-size:18px; font-weight:900; margin-bottom:8px; }
.logo span { color:#3B82F6; }
.subtitle { text-align:center; color:#94A3B8; font-size:14px; margin-bottom:28px; }
.subtitle strong { color:#F1F5F9; }
label { display:block; font-size:12px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px; }
.field { margin-bottom:18px; }
input[type="text"], input[type="tel"] {
  width:100%; background:#161E2E; border:1px solid #2A3548; border-radius:10px;
  padding:14px 16px; font-size:16px; color:#F1F5F9; outline:none;
}
input[type="text"]:focus, input[type="tel"]:focus { border-color:#3B82F6; }
.consent { display:flex; align-items:flex-start; gap:10px; margin-bottom:24px; }
.consent input { margin-top:3px; width:18px; height:18px; flex-shrink:0; accent-color:#3B82F6; }
.consent label { font-size:12px; color:#94A3B8; text-transform:none; font-weight:400; line-height:1.5; margin-bottom:0; }
.consent a { color:#60A5FA; text-decoration:underline; }
button {
  width:100%; background:linear-gradient(135deg,#3B82F6,#6366F1); color:white;
  border:none; padding:16px; border-radius:12px; font-size:16px; font-weight:700;
  cursor:pointer;
}
button:disabled { opacity:0.5; cursor:not-allowed; }
.error { background:#450a0a; border:1px solid #ef444433; color:#EF4444; padding:12px 16px; border-radius:10px; font-size:13px; margin-bottom:18px; display:none; }
.success { display:none; text-align:center; padding:20px 0; }
.success .icon { font-size:48px; margin-bottom:16px; }
.success h2 { font-size:20px; margin-bottom:8px; }
.success p { color:#94A3B8; font-size:14px; }
.form-area.hidden { display:none; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">DOOH<span>PLAY</span></div>
  <div class="subtitle">Cadastre-se e receba <strong id="biz-name">novidades</strong> em primeira mão</div>

  <div id="error-box" class="error"></div>

  <div id="form-area" class="form-area">
    <form id="lead-form">
      <div class="field">
        <label for="name">Seu nome</label>
        <input type="text" id="name" autocomplete="name" placeholder="Como podemos te chamar?">
      </div>
      <div class="field">
        <label for="phone">WhatsApp</label>
        <input type="tel" id="phone" autocomplete="tel" placeholder="(11) 99999-9999">
      </div>
      <div class="consent">
        <input type="checkbox" id="consent">
        <label for="consent">Aceito receber novidades e promoções pelo WhatsApp deste estabelecimento, de acordo com a <a href="/privacidade" target="_blank">política de privacidade</a>.</label>
      </div>
      <button type="submit" id="submit-btn">Cadastrar</button>
    </form>
  </div>

  <div id="success-area" class="success">
    <div class="icon">✅</div>
    <h2>Cadastro realizado!</h2>
    <p>Você vai receber novidades direto no seu WhatsApp.</p>
  </div>
</div>

<script>
(function() {
  var code = ${JSON.stringify(upperCode)};
  var form = document.getElementById('lead-form');
  var errorBox = document.getElementById('error-box');
  var formArea = document.getElementById('form-area');
  var successArea = document.getElementById('success-area');
  var submitBtn = document.getElementById('submit-btn');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  function hideError() {
    errorBox.style.display = 'none';
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    hideError();

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var consent = document.getElementById('consent').checked;

    if (!name) { showError('Informe seu nome.'); return; }
    if (!phone) { showError('Informe seu WhatsApp.'); return; }
    if (!consent) { showError('É necessário aceitar os termos para continuar.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    fetch('/api/leads/' + encodeURIComponent(code), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, consent_accepted: consent })
    })
      .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
      .then(function(result) {
        if (!result.ok) {
          showError(result.data.error || 'Erro ao processar seu cadastro.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Cadastrar';
          return;
        }
        formArea.classList.add('hidden');
        successArea.style.display = 'block';
      })
      .catch(function() {
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cadastrar';
      });
  });
})();
</script>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
